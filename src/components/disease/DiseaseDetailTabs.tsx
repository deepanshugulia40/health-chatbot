"use client";

import { Check, ShieldCheck, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/lib/i18n/I18nProvider";
import type { TKey } from "@/lib/i18n/translate";
import type { TopicDetail } from "@/lib/content";

const TABS: { value: string; label: TKey }[] = [
  { value: "symptoms", label: "diseases.tabs.symptoms" },
  { value: "causes", label: "diseases.tabs.causes" },
  { value: "prevention", label: "diseases.tabs.prevention" },
  { value: "myths", label: "diseases.tabs.myths" },
  { value: "help", label: "diseases.tabs.help" },
];

function CardGrid({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="text-muted-foreground">{empty}</p>;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="rounded-lg bg-card p-4 text-sm leading-6 ring-1 ring-border">
          {item}
        </li>
      ))}
    </ul>
  );
}

function CheckList({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="text-muted-foreground">{empty}</p>;
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 rounded-lg bg-card p-4 text-sm leading-6 ring-1 ring-border">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function DiseaseDetailTabs({ topic }: { topic: TopicDetail }) {
  const { t } = useTranslation();
  const empty = t("diseases.noInfo");

  return (
    <Tabs defaultValue="symptoms" className="gap-6">
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <TabsList variant="line" className="min-w-max">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {t(tab.label)}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="symptoms" className="space-y-5">
        <h2 className="text-2xl font-semibold">{t("diseases.commonSymptoms")}</h2>
        <CardGrid items={topic.symptoms} empty={empty} />
        {topic.whenToSeekHelp.length > 0 && (
          <div className="rounded-lg border-l-4 border-terracotta bg-warn p-5 text-warn-foreground">
            <h3 className="font-heading text-lg font-semibold">{t("diseases.urgentTitle")}</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6">
              {topic.whenToSeekHelp.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </TabsContent>

      <TabsContent value="causes" className="space-y-5">
        <h2 className="text-2xl font-semibold">{t("diseases.tabs.causes")}</h2>
        <CardGrid items={topic.causes} empty={empty} />
      </TabsContent>

      <TabsContent value="prevention" className="space-y-5">
        <h2 className="text-2xl font-semibold">{t("diseases.tabs.prevention")}</h2>
        <CheckList items={topic.prevention} empty={empty} />
      </TabsContent>

      <TabsContent value="myths" className="space-y-5">
        <h2 className="text-2xl font-semibold">{t("diseases.tabs.myths")}</h2>
        {topic.mythsVsFacts.length === 0 ? (
          <p className="text-muted-foreground">{empty}</p>
        ) : (
          <ul className="space-y-3">
            {topic.mythsVsFacts.map((m) => (
              <li key={m.myth} className="space-y-2 rounded-lg bg-card p-4 text-sm leading-6 ring-1 ring-border">
                <p className="flex gap-3">
                  <X className="mt-0.5 size-5 shrink-0 text-terracotta" aria-hidden />
                  <span>
                    <strong>{t("diseases.myth")}</strong> {m.myth}
                  </span>
                </p>
                <p className="flex gap-3">
                  <Check className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                  <span>
                    <strong>{t("diseases.fact")}</strong> {m.fact}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </TabsContent>

      <TabsContent value="help" className="space-y-5">
        <h2 className="text-2xl font-semibold">{t("diseases.tabs.help")}</h2>
        {topic.whenToSeekHelp.length === 0 ? (
          <p className="text-muted-foreground">{empty}</p>
        ) : (
          <div className="rounded-lg border-l-4 border-terracotta bg-warn p-5 text-warn-foreground">
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6">
              {topic.whenToSeekHelp.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
