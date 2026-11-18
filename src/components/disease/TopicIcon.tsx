import {
  Activity,
  Apple,
  Bug,
  Droplets,
  HandHelping,
  HeartPulse,
  Stethoscope,
  Syringe,
  Thermometer,
  Wind,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  bug: Bug,
  droplets: Droplets,
  wind: Wind,
  activity: Activity,
  stethoscope: Stethoscope,
  "heart-pulse": HeartPulse,
  thermometer: Thermometer,
  apple: Apple,
  syringe: Syringe,
  hand: HandHelping,
};

/** Icon keys a topic can use (the admin form offers exactly these). */
export const TOPIC_ICON_KEYS = Object.keys(ICONS);

/** Renders the Lucide icon stored on a topic (falls back to a heart-pulse). */
export function TopicIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = (name && ICONS[name]) || HeartPulse;
  return <Icon className={className} aria-hidden />;
}
