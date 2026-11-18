"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { AlertCircle, Siren } from "lucide-react";
import { useTranslation } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";
import { FeedbackButtons } from "./FeedbackButtons";
import { SourceCitation } from "./SourceCitation";
import { TypingIndicator } from "./TypingIndicator";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const { t } = useTranslation();
  const isUser = message.role === "user";
  const waiting = !isUser && message.status === "streaming" && !message.content;
  const emergency = !isUser && message.flaggedEmergency;
  const grounded = !isUser && message.status === "done" && !emergency && (message.citedSources?.length ?? 0) > 0;

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex justify-end"
      >
        <div className="max-w-[85%] rounded-xl rounded-br-sm bg-primary px-4 py-2.5 text-sm leading-6 text-primary-foreground sm:max-w-[70%]">
          <span className="sr-only">{t("chat.youSaid")}</span>
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-3"
    >
      <span
        aria-hidden
        className={cn(
          "mt-1 flex size-9 shrink-0 items-center justify-center rounded-full font-heading text-base font-semibold text-white",
          emergency ? "bg-destructive" : "bg-terracotta"
        )}
      >
        {emergency ? <Siren className="size-4" /> : "S"}
      </span>
      <div
        className={cn(
          "min-w-0 max-w-[92%] flex-1 rounded-2xl bg-card p-5 text-[0.9375rem] leading-7 ring-1 ring-border sm:max-w-[85%] sm:flex-none",
          emergency && "bg-warn text-warn-foreground ring-2 ring-destructive/50",
          message.status === "error" && "ring-destructive/40"
        )}
        role={emergency ? "alert" : undefined}
      >
        <span className="sr-only">{t("chat.assistantSaid")}</span>
        {emergency && <span className="sr-only">{t("chat.emergency")}.</span>}
        {waiting ? (
          <TypingIndicator />
        ) : (
          <div className="space-y-3 break-words [&_a]:text-primary [&_a]:underline [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ul]:marker:text-terracotta">
            <ReactMarkdown
              disallowedElements={["img"]}
              unwrapDisallowed
              components={{
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        {message.status === "error" && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="size-3.5" aria-hidden /> {t("chat.incomplete")}
          </p>
        )}
        {!isUser && message.citedSources && <SourceCitation sources={message.citedSources} />}
        {grounded && (
          <p className="mt-3 rounded-md bg-warn px-3 py-2 text-xs leading-5 text-warn-foreground">
            {t("chat.answerDisclaimer")}
          </p>
        )}
        {/* Only saved replies (signed-in users) can be rated. */}
        {message.serverId && message.status === "done" && !emergency && (
          <FeedbackButtons messageId={message.serverId} initial={message.feedback} />
        )}
      </div>
    </motion.div>
  );
}
