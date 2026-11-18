"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Info, PanelLeft, Square } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useChat, type InitialConversation } from "@/hooks/useChat";
import { useTranslation } from "@/lib/i18n/I18nProvider";
import { ConversationSidebar, type SidebarConversation } from "./ConversationSidebar";
import { MessageBubble } from "./MessageBubble";
import { SuggestedQuestions } from "./SuggestedQuestions";

const MAX_LEN = 2000;

export function ChatWindow({
  initialConversation,
  conversations = [],
  signedIn = false,
}: {
  initialConversation?: InitialConversation;
  conversations?: SidebarConversation[];
  signedIn?: boolean;
}) {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { messages, send, stop, reset, isStreaming, error } = useChat(locale, initialConversation);
  const [input, setInput] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const wasStreaming = useRef(false);

  // Keep the newest content in view while tokens stream in.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  // When a reply finishes, refresh the server data so a new conversation shows up in the sidebar.
  useEffect(() => {
    if (wasStreaming.current && !isStreaming && signedIn) router.refresh();
    wasStreaming.current = isStreaming;
  }, [isStreaming, signedIn, router]);

  function submit(text = input) {
    if (!text.trim() || isStreaming) return;
    send(text);
    setInput("");
    inputRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Ignore Enter while an IME (e.g. Hindi typing) is composing a word.
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  function startNew() {
    reset();
    // Leave a resumed conversation's URL so a refresh does not bring it back.
    if (initialConversation) router.replace("/chat");
  }

  const sidebar = (onNavigate?: () => void) => (
    <ConversationSidebar
      conversations={conversations}
      signedIn={signedIn}
      activeId={initialConversation?.id}
      onNew={startNew}
      onNavigate={onNavigate}
    />
  );

  return (
    <div className="mx-auto grid h-[calc(100dvh-4.1rem)] min-h-128 w-full max-w-[96rem] md:grid-cols-[17rem_minmax(0,1fr)]">
      {/* Desktop sidebar */}
      <aside aria-label={t("chat.historyToggle")} className="hidden border-r bg-muted md:block">
        {sidebar()}
      </aside>

      <section aria-label={t("chat.label")} className="flex min-h-0 flex-col">
        <h1 className="sr-only">{t("chat.title")}</h1>

        {/* Mobile: conversations drawer */}
        <div className="flex items-center justify-between border-b px-3 py-2 md:hidden">
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger render={<Button variant="ghost" size="sm" />}>
              <PanelLeft aria-hidden /> {t("chat.historyToggle")}
            </SheetTrigger>
            <SheetContent side="left" className="bg-muted p-0">
              <SheetTitle className="sr-only">{t("chat.historyToggle")}</SheetTitle>
              {sidebar(() => setDrawerOpen(false))}
            </SheetContent>
          </Sheet>
        </div>

        <div
          role="log"
          aria-live="polite"
          aria-busy={isStreaming}
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-6 px-4 py-8">
            {messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-6 py-10 text-center">
                <div>
                  <h2 className="text-3xl font-semibold">{t("chat.greeting")}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{t("chat.greetingSub")}</p>
                </div>
                {!signedIn && (
                  <p className="flex max-w-sm items-start gap-1.5 text-xs text-muted-foreground">
                    <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                    {t("chat.guestNotice")}
                  </p>
                )}
              </div>
            ) : (
              messages.map((m) => <MessageBubble key={m.id} message={m} />)
            )}
            <div ref={endRef} />
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mx-auto mb-2 flex w-full max-w-3xl items-start gap-2 rounded-lg bg-warn px-3 py-2 text-sm text-warn-foreground"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            {error}
          </div>
        )}

        <div className="mx-auto w-full max-w-3xl px-4 pb-4">
          {messages.length === 0 && (
            <div className="mb-3">
              <SuggestedQuestions onSelect={submit} disabled={isStreaming} />
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="flex items-end gap-2 rounded-xl border border-foreground/70 bg-card p-2 focus-within:ring-3 focus-within:ring-ring/30"
          >
            <label htmlFor="chat-input" className="sr-only">
              {t("chat.inputLabel")}
            </label>
            <textarea
              id="chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              maxLength={MAX_LEN}
              rows={1}
              placeholder={t("chat.placeholder")}
              className="max-h-36 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            {isStreaming ? (
              <Button type="button" size="lg" variant="outline" onClick={stop} aria-label={t("chat.stop")}>
                <Square aria-hidden />
              </Button>
            ) : (
              <Button type="submit" size="lg" disabled={!input.trim()} aria-label={t("chat.send")}>
                {t("chat.sendButton")}
              </Button>
            )}
          </form>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">{t("chat.hint")}</p>
        </div>
      </section>
    </div>
  );
}
