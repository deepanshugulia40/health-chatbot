import "server-only";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { CHAT_MODEL, getOpenAI } from "./openai";

export type LLMMessage = ChatCompletionMessageParam;

/**
 * Streams assistant text token-by-token.
 * Low temperature: this is a factual health-awareness assistant.
 */
export async function* streamChat(opts: {
  messages: LLMMessage[];
  signal?: AbortSignal;
}): AsyncGenerator<string> {
  const stream = await getOpenAI().chat.completions.create(
    {
      model: CHAT_MODEL(),
      messages: opts.messages,
      stream: true,
      temperature: 0.2,
      max_tokens: 800,
    },
    { signal: opts.signal, timeout: 60_000 }
  );

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) yield text;
  }
}
