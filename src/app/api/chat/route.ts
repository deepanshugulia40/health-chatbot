import mongoose from "mongoose";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/connect";
import { Conversation } from "@/lib/db/models/Conversation";
import { Message } from "@/lib/db/models/Message";
import { streamChat } from "@/lib/ai/chatCompletion";
import { isOpenAIConfigured, toUserMessage } from "@/lib/ai/openai";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { buildMessages, fitContext, stripSourceMarker } from "@/lib/rag/promptBuilder";
import { retrieveChunks, type RetrievedChunk } from "@/lib/rag/retrieve";
import { analyzeInput } from "@/lib/safety/inputValidation";
import { OutputGate } from "@/lib/safety/outputGuardrails";
import {
  emergencyResponse,
  guardrailFallbackResponse,
  harmfulRequestResponse,
  noVerifiedInfoResponse,
  offTopicResponse,
} from "@/lib/safety/responses";
import { SSE_HEADERS, sseFrame } from "@/lib/sse";
import type { ChatStreamEvent, CitedSource } from "@/types/chat";

export const runtime = "nodejs";
export const maxDuration = 60;

const num = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && v !== undefined && v !== "" ? n : fallback;
};
const HISTORY_LIMIT = Math.max(0, num(process.env.CHAT_HISTORY_LIMIT, 10));
const RAG_ENABLED = process.env.RAG_ENABLED !== "false";
const RAG_TOP_K = Math.max(1, num(process.env.RAG_TOP_K, 5));
const RAG_MIN_SCORE = num(process.env.RAG_MIN_SCORE, 0.35);
const RAG_CONTEXT_TOKENS = Math.max(500, num(process.env.RAG_CONTEXT_TOKENS, 3000));

const bodySchema = z.object({
  conversationId: z.string().refine((v) => mongoose.isValidObjectId(v), "Invalid conversation id").optional(),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message is too long (max 2000 characters)"),
  language: z.enum(LOCALES).default("en"),
  // Guests are not persisted, so their client sends recent context along.
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .max(30)
    .optional(),
});

const fail = (error: string, status: number) => Response.json({ success: false, error }, { status });

/** Dev-only stand-in so the chat UI can be used before an OpenAI key exists. */
async function* stubReply(message: string): AsyncGenerator<string> {
  const text =
    `**Development mode:** the AI service is not configured yet (no \`OPENAI_API_KEY\`).\n\n` +
    `You asked: "${message}"\n\nOnce the key is added, this will be answered by the assistant.`;
  for (const word of text.split(/(\s+)/)) {
    yield word;
    await new Promise((r) => setTimeout(r, 15));
  }
}

/** Follow-ups like "what about prevention?" retrieve poorly alone, so add the prior question. */
function retrievalQuery(message: string, history: { role: string; content: string }[]) {
  if (message.length >= 40) return message;
  const lastUser = [...history].reverse().find((m) => m.role === "user");
  return lastUser ? `${lastUser.content} ${message}`.slice(0, 600) : message;
}

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid request", 400);
    const { language } = parsed.data;
    let { conversationId } = parsed.data;
    let history = parsed.data.history ?? [];

    // --- Safety: sanitise, redact PII, detect emergencies / harmful / injection ---
    const analysis = analyzeInput(parsed.data.message);
    const message = analysis.text;
    // Static safety replies follow the script the user wrote in.
    const replyLocale: Locale = /[ऀ-ॿ]/.test(message) ? "hi" : language;

    const configured = isOpenAIConfigured();
    if (analysis.kind === "ok" && !configured && process.env.NODE_ENV === "production") {
      return fail("The AI service is not configured.", 503);
    }

    const session = await auth();
    const userId = session?.user?.id;

    // --- Persistence (logged-in users only). Failures never block the chat. ---
    let persisted = false;
    if (userId) {
      try {
        await connectDB();
        if (conversationId) {
          const convo = await Conversation.findOne({ _id: conversationId, userId }).select("_id").lean();
          if (!convo) return fail("Conversation not found", 404);
          const prior = await Message.find({ conversationId })
            .sort({ createdAt: -1 })
            .limit(HISTORY_LIMIT)
            .select("role content")
            .lean();
          history = prior.reverse().filter((m) => m.role !== "system") as typeof history;
        } else {
          const convo = await Conversation.create({ userId, title: message.slice(0, 60), language });
          conversationId = String(convo._id);
        }
        await Message.create({
          conversationId,
          role: "user",
          content: message,
          flaggedEmergency: analysis.kind === "emergency",
        });
        persisted = true;
      } catch (err) {
        console.error("[chat] persistence unavailable:", err instanceof Error ? err.message : err);
        conversationId = undefined;
      }
    } else {
      conversationId = undefined;
    }

    const signal = request.signal;

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (e: ChatStreamEvent) => {
          try {
            controller.enqueue(sseFrame(e));
          } catch {
            /* client disconnected */
          }
        };

        /** Saves the assistant reply; returns its id (or undefined if not persisted). */
        const saveReply = async (content: string, extra: { citedSources?: CitedSource[]; flaggedEmergency?: boolean } = {}) => {
          if (!persisted || !conversationId || !content) return undefined;
          try {
            const saved = await Message.create({
              conversationId,
              role: "assistant",
              content,
              citedSources: extra.citedSources?.length ? extra.citedSources : undefined,
              flaggedEmergency: extra.flaggedEmergency ?? false,
            });
            await Conversation.updateOne({ _id: conversationId }, { $set: { updatedAt: new Date() } });
            return String(saved._id);
          } catch (err) {
            console.error("[chat] failed to save reply:", err instanceof Error ? err.message : err);
            return undefined;
          }
        };

        /** Sends a pre-approved static reply (no LLM involved). */
        const sendStatic = async (text: string, flaggedEmergency = false) => {
          send({ type: "token", text });
          const messageId = await saveReply(text, { flaggedEmergency });
          send({ type: "done", messageId, citedSources: [], flaggedEmergency });
        };

        send({ type: "meta", conversationId });

        try {
          // 1. Emergencies and refusals never reach retrieval or the LLM.
          if (analysis.kind === "emergency") {
            // Log the category only, never the message (it may contain health details).
            console.warn(`[safety] emergency guidance shown: ${analysis.category} (${analysis.ruleId})`);
            await sendStatic(emergencyResponse(analysis.category, replyLocale), true);
            return;
          }
          if (analysis.kind === "refuse") {
            console.warn(`[safety] request refused: ${analysis.reason}`);
            await sendStatic(
              (analysis.reason === "harmful" ? harmfulRequestResponse : offTopicResponse)[replyLocale]
            );
            return;
          }

          // 2. Development stand-in (no OpenAI key).
          if (!configured) {
            let full = "";
            for await (const t of stubReply(message)) {
              full += t;
              send({ type: "token", text: t });
            }
            const messageId = await saveReply(full);
            send({ type: "done", messageId, citedSources: [] });
            return;
          }

          // 3. Retrieval-augmented generation.
          let used: RetrievedChunk[] = [];
          if (RAG_ENABLED) {
            let found: RetrievedChunk[];
            try {
              found = await retrieveChunks(retrievalQuery(message, history), {
                topK: RAG_TOP_K,
                minScore: RAG_MIN_SCORE,
              });
            } catch (err) {
              console.error("[chat] retrieval failed:", err instanceof Error ? err.message : err);
              send({ type: "error", message: toUserMessage(err) });
              return;
            }
            if (found.length === 0) {
              // Honest fallback instead of letting the model guess.
              await sendStatic(noVerifiedInfoResponse[replyLocale]);
              return;
            }
            used = fitContext(found, RAG_CONTEXT_TOKENS);
          }

          const llmMessages = buildMessages({
            language,
            history,
            userMessage: message,
            historyLimit: HISTORY_LIMIT,
            context: used.length ? used : undefined,
          });

          // 4. Generate, releasing text only after the output guardrail clears each sentence.
          const gate = new OutputGate();
          let shown = "";
          let blocked: string | undefined;
          const marker = { noSources: false };
          for await (const token of stripSourceMarker(streamChat({ messages: llmMessages, signal }), marker)) {
            const r = gate.push(token);
            if (r.emit) {
              shown += r.emit;
              send({ type: "token", text: r.emit });
            }
            if (r.blocked) {
              blocked = r.blocked;
              break; // stops the upstream stream
            }
          }
          if (!blocked) {
            const r = gate.flush();
            if (r.emit) {
              shown += r.emit;
              send({ type: "token", text: r.emit });
            }
            blocked = r.blocked;
          }
          if (signal.aborted) return;

          if (blocked) {
            console.warn(`[safety] model output blocked: ${blocked}`);
            const fallback = guardrailFallbackResponse[replyLocale];
            send({ type: "replace", text: fallback });
            const messageId = await saveReply(fallback);
            send({ type: "done", messageId, citedSources: [] });
            return;
          }

          // 5. Citations: exactly the chunks that were placed in the prompt.
          // (none if the model said it did not use the context, e.g. a refusal)
          const citedSources: CitedSource[] = (marker.noSources ? [] : used).map((c) => ({
            documentId: c.documentId,
            sourceName: c.sourceName,
            sourceUrl: c.sourceUrl,
            chunkText: c.text.slice(0, 500),
          }));
          const messageId = await saveReply(shown, { citedSources });
          send({ type: "done", messageId, citedSources });
        } catch (err) {
          if (!signal.aborted) {
            console.error("[chat] generation failed:", err instanceof Error ? err.message : err);
            send({ type: "error", message: toUserMessage(err) });
          }
        } finally {
          try {
            controller.close();
          } catch {
            /* already closed */
          }
        }
      },
    });

    return new Response(stream, { headers: SSE_HEADERS });
  } catch (err) {
    console.error("[chat] unexpected error:", err instanceof Error ? err.message : err);
    return fail("Something went wrong. Please try again.", 500);
  }
}
