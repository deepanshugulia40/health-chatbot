import "server-only";
import OpenAI from "openai";

let client: OpenAI | null = null;

export function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

/** Lazily-created singleton. Throws if no API key is configured. */
export function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set.");
  client ??= new OpenAI({
    apiKey,
    // OPENAI_BASE_URL is also read by the SDK itself; stated here for clarity.
    baseURL: process.env.OPENAI_BASE_URL || undefined,
    maxRetries: 2,
  });
  return client;
}

export const CHAT_MODEL = () => process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";
export const EMBEDDING_MODEL = () => process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

/** Turns an SDK/network error into a message that is safe to show users. */
export function toUserMessage(err: unknown): string {
  if (err instanceof OpenAI.APIError) {
    if (err.status === 401 || err.status === 403) return "The AI service is not configured correctly. Please contact the site owner.";
    if (err.status === 429) return "The assistant is busy right now. Please try again in a moment.";
    if (err.status && err.status >= 500) return "The AI service is having trouble. Please try again shortly.";
  }
  if (err instanceof OpenAI.APIConnectionTimeoutError) return "The assistant took too long to respond. Please try again.";
  if (err instanceof OpenAI.APIConnectionError) return "Could not reach the AI service. Please check your connection and try again.";
  return "Something went wrong while generating a response. Please try again.";
}
