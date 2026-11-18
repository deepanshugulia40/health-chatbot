import type { Locale } from "@/lib/i18n/config";

export type Language = Locale;

export type CitedSource = {
  documentId?: string;
  sourceName: string;
  sourceUrl: string;
  chunkText?: string;
};

export type ChatRole = "user" | "assistant";

/** A message as held in client state. */
export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  citedSources?: CitedSource[];
  /** Server id once persisted (logged-in users only). */
  serverId?: string;
  /** True for the static emergency / crisis guidance. */
  flaggedEmergency?: boolean;
  /** The signed-in user's thumbs rating for this reply, if any. */
  feedback?: "up" | "down";
  status?: "streaming" | "done" | "error";
};

/** Server-sent events emitted by POST /api/chat. */
export type ChatStreamEvent =
  | { type: "meta"; conversationId?: string }
  | { type: "token"; text: string }
  /** Replaces everything streamed so far (used when the output guardrail trips). */
  | { type: "replace"; text: string }
  | { type: "done"; messageId?: string; citedSources: CitedSource[]; flaggedEmergency?: boolean }
  | { type: "error"; message: string };

export type ChatRequestBody = {
  conversationId?: string;
  message: string;
  language: Language;
  history?: { role: ChatRole; content: string }[];
};
