import {
  Activity,
  Bug,
  Droplets,
  HeartPulse,
  Stethoscope,
  Thermometer,
  Wind,
  type LucideIcon,
} from "lucide-react";
import type { TKey } from "@/lib/i18n/translate";

export const NAV_LINKS: readonly { href: string; labelKey: TKey }[] = [
  { href: "/", labelKey: "nav.home" },
  { href: "/diseases", labelKey: "nav.diseases" },
  { href: "/chat", labelKey: "nav.chat" },
  { href: "/tips", labelKey: "nav.tips" },
  { href: "/campaigns", labelKey: "nav.campaigns" },
];

/** Names and summaries come from the dictionaries (`quick.<slug>.*`). */
export const DISEASE_LINKS: { slug: string; icon: LucideIcon }[] = [
  { slug: "dengue", icon: Bug },
  { slug: "malaria", icon: Droplets },
  { slug: "tuberculosis", icon: Wind },
  { slug: "diabetes", icon: Activity },
  { slug: "hypertension", icon: Stethoscope },
  { slug: "heart-disease", icon: HeartPulse },
  { slug: "seasonal-illnesses", icon: Thermometer },
];

export const TRUSTED_SOURCES = [
  { name: "WHO", full: "World Health Organization", url: "https://www.who.int" },
  { name: "MoHFW", full: "Ministry of Health & Family Welfare, India", url: "https://mohfw.gov.in" },
  { name: "NHP", full: "National Health Portal India", url: "https://nhp.gov.in" },
  { name: "NCDC", full: "National Centre for Disease Control", url: "https://ncdc.mohfw.gov.in" },
] as const;
