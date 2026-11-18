"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatRequestBody, ChatStreamEvent } from "@/types/chat";

/** Splits an SSE byte stream into parsed events. */
async function readEvents(body: ReadableStream<Uint8Array>, onEvent: (e: ChatStreamEvent) => void) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const data = frame
        .split("\n")
        .filter((l) => l.startsWith("data:"))
        .map((l) => l.slice(5).trimStart())
        .join("\n");
      if (!data) continue;
      try {
        onEvent(JSON.parse(data) as ChatStreamEvent);
      } catch {
        /* ignore malformed frame */
      }
    }
  }
}

export function isAbortError(err: unknown) {
  return err instanceof DOMException && err.name === "AbortError";
}

/** POSTs to /api/chat and delivers streamed events to a callback. */
export function useStreamingResponse() {
  const abortRef = useRef<AbortController | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const abort = useCallback(() => abortRef.current?.abort(), []);

  // Cancel any in-flight request on unmount.
  useEffect(() => () => abortRef.current?.abort(), []);

  const start = useCallback(async (body: ChatRequestBody, onEvent: (e: ChatStreamEvent) => void) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsStreaming(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? "Could not reach the assistant. Please try again.");
      }
      await readEvents(res.body, onEvent);
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  return { start, abort, isStreaming };
}
