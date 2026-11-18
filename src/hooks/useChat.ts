"use client";

import { useCallback, useRef, useState } from "react";
import type { ChatMessage, ChatStreamEvent, Language } from "@/types/chat";
import { isAbortError, useStreamingResponse } from "./useStreamingResponse";

const CLIENT_HISTORY = 10;
// crypto.randomUUID() only exists in secure contexts (https or localhost), so
// opening the site over plain http on a network IP (e.g. from a phone) would
// crash. getRandomValues is available everywhere, so build a v4 UUID from it.
const newId = (): string => {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};

export type InitialConversation = { id: string; messages: ChatMessage[] };

/** `initial` lets a saved conversation be resumed (its id is reused for new messages). */
export function useChat(language: Language = "en", initial?: InitialConversation) {
  const [messages, setMessages] = useState<ChatMessage[]>(initial?.messages ?? []);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>(initial?.messages ?? []);
  const conversationIdRef = useRef<string | undefined>(initial?.id);
  const { start, abort, isStreaming } = useStreamingResponse();

  const update = useCallback((fn: (prev: ChatMessage[]) => ChatMessage[]) => {
    setMessages((prev) => {
      const next = fn(prev);
      messagesRef.current = next;
      return next;
    });
  }, []);

  const patch = useCallback(
    (id: string, fn: (m: ChatMessage) => ChatMessage) =>
      update((prev) => prev.map((m) => (m.id === id ? fn(m) : m))),
    [update]
  );

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || isStreaming) return;
      setError(null);

      const history = messagesRef.current
        .filter((m) => m.status !== "error" && m.content)
        .slice(-CLIENT_HISTORY)
        .map(({ role, content }) => ({ role, content }));

      const assistantId = newId();
      update((prev) => [
        ...prev,
        { id: newId(), role: "user", content: text, status: "done" },
        { id: assistantId, role: "assistant", content: "", status: "streaming" },
      ]);

      const onEvent = (e: ChatStreamEvent) => {
        switch (e.type) {
          case "meta":
            if (e.conversationId) conversationIdRef.current = e.conversationId;
            break;
          case "token":
            patch(assistantId, (m) => ({ ...m, content: m.content + e.text }));
            break;
          case "replace":
            // The output guardrail rejected the draft: swap in the safe reply.
            patch(assistantId, (m) => ({ ...m, content: e.text, citedSources: undefined }));
            break;
          case "done":
            patch(assistantId, (m) => ({
              ...m,
              status: "done",
              serverId: e.messageId,
              citedSources: e.citedSources,
              flaggedEmergency: e.flaggedEmergency,
            }));
            break;
          case "error":
            setError(e.message);
            patch(assistantId, (m) => ({ ...m, status: "error" }));
            break;
        }
      };

      try {
        await start({ conversationId: conversationIdRef.current, message: text, language, history }, onEvent);
        // Stream ended without a terminal event (e.g. dropped connection).
        patch(assistantId, (m) => (m.status === "streaming" ? { ...m, status: m.content ? "done" : "error" } : m));
      } catch (err) {
        if (isAbortError(err)) {
          patch(assistantId, (m) => ({ ...m, status: "done" }));
        } else {
          setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
          patch(assistantId, (m) => ({ ...m, status: "error" }));
        }
      }
      // Drop empty assistant bubbles left by failures/aborts.
      update((prev) => prev.filter((m) => !(m.role === "assistant" && !m.content)));
    },
    [isStreaming, language, patch, start, update]
  );

  const reset = useCallback(() => {
    abort();
    conversationIdRef.current = undefined;
    setError(null);
    update(() => []);
  }, [abort, update]);

  return { messages, send, stop: abort, reset, isStreaming, error };
}
