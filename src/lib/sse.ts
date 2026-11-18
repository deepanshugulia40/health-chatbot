import type { ChatStreamEvent } from "@/types/chat";

const encoder = new TextEncoder();

/** Encodes one Server-Sent Event frame. */
export function sseFrame(event: ChatStreamEvent): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(event)}\n\n`);
}

export const SSE_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
} as const;
