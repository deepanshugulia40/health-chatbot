/**
 * Pre-generation checks (PLAN.md section 11). Runs before retrieval or the LLM.
 *
 * Order matters:
 *   1. sanitise + redact personal identifiers
 *   2. emergency check (first, so an injection attempt cannot hide an emergency)
 *   3. clearly harmful requests -> static refusal
 *   4. prompt-injection phrases -> stripped; if nothing is left -> static refusal
 */
import { detectEmergency, normalizeForMatching, type EmergencyCategory } from "./emergencyKeywords";

export type InputAnalysis =
  | { kind: "emergency"; text: string; category: EmergencyCategory; ruleId: string }
  | { kind: "refuse"; text: string; reason: "harmful" | "injection-only" }
  | { kind: "ok"; text: string; injectionStripped: boolean; redacted: boolean };

/** Removes control and zero-width characters and tidies whitespace. */
export function sanitizeInput(raw: string): string {
  return raw
    .normalize("NFKC")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/[​-‍⁠﻿]/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const PII_RULES: [RegExp, string][] = [
  [/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, "[email removed]"],
  [/(?<!\d)\d{4}[ -]?\d{4}[ -]?\d{4}(?!\d)/g, "[ID number removed]"], // Aadhaar-style
  [/(?<!\d)(?:\+?91[ -]?)?[6-9]\d{9}(?!\d)/g, "[phone number removed]"],
  [/\b[A-Z]{5}\d{4}[A-Z]\b/g, "[ID number removed]"], // PAN-style
];

/** Masks personal identifiers so they are neither stored nor sent to the LLM. */
export function redactPII(text: string): { text: string; redacted: boolean } {
  let out = text;
  for (const [pattern, replacement] of PII_RULES) out = out.replace(pattern, replacement);
  return { text: out, redacted: out !== text };
}

// Requests for harmful instructions get a static refusal without calling the LLM.
const HARMFUL: RegExp[] = [
  /\b(?:make|mix|create|prepare|cook|brew|synthesi[sz]e|produce)\b.{0,40}\b(?:dangerous|deadly|lethal|toxic|poisonous)\b/i,
  /\bhow (?:to|do i|can i|would i)\b.{0,30}\b(?:make|prepare|cook|brew|synthesi[sz]e|produce)\b.{0,40}\b(?:drugs?|poison|meth|cocaine|heroin|explosives?|bomb|toxin)\b/i,
  /\b(?:poison|kill|murder|harm)\b\s+(?:my |a |an |the )?(?:someone|somebody|him|her|them|wife|husband|neighbou?r|boss|colleague|family|parents?|child|baby)\b/i,
  /\bhow (?:to|do i|can i)\b.{0,20}\bpoison\b/i,
];

// Attempts to override the assistant's instructions.
const INJECTION: RegExp[] = [
  /\b(?:ignore|disregard|forget|override|bypass|skip)\b\s+(?:(?:all|any|the|your|these|those|previous|prior|above|earlier|system|safety|my)\s+)*(?:instructions?|rules?|prompts?|guidelines?|directions?|restrictions?|guardrails?|constraints?)/gi,
  /\b(?:reveal|show|print|repeat|display|tell me|leak)\b\s+(?:me\s+)?(?:your|the)\s+(?:system|hidden|initial|original|secret)\s+(?:prompt|instructions?|message)/gi,
  /\byou are (?:now )?(?:dan|jailbroken|unrestricted|no longer bound[^.]*)/gi,
  /\b(?:act|behave|respond) as (?:an? )?(?:unrestricted|jailbroken|dan|evil|uncensored)[^.]*/gi,
  /\b(?:developer|god|admin|sudo) mode\b/gi,
  /\bjailbreak\b/gi,
  /\bdo anything now\b/gi,
  /\bpretend (?:that )?(?:you have|there are) no (?:rules|restrictions|limits|guidelines)/gi,
  /(?:<\|?\s*system\s*\|?>|\[\/?inst\]|^#{2,}\s*(?:system|instruction)s?\b)/gim,
  /^\s*(?:system|assistant)\s*:/gim,
  /(?:पिछले|पहले के|सभी|अपने) (?:निर्देश|नियम)(?:ों)?(?: को)? (?:अनदेखा|भूल|इग्नोर|नज़रअंदाज़)\S*/g,
  /(?:इग्नोर|अनदेखा) (?:करो|करें|कर दो)/g,
];

const hasLetters = (s: string) => /[\p{L}\p{N}]{3,}/u.test(s);

export function analyzeInput(raw: string): InputAnalysis {
  const sanitized = sanitizeInput(raw);
  const { text: redactedText, redacted } = redactPII(sanitized);

  // 1. Emergencies first: never blocked or diluted by injection stripping.
  const emergency = detectEmergency(redactedText);
  if (emergency?.category === "mental-health") {
    return { kind: "emergency", text: redactedText, category: emergency.category, ruleId: emergency.ruleId };
  }

  // 2. Harmful instructions ("how to poison my neighbour" is a refusal, not a
  //    medical emergency, even though it contains the word "poison").
  const normalized = normalizeForMatching(redactedText);
  if (HARMFUL.some((p) => p.test(normalized))) {
    return { kind: "refuse", text: redactedText, reason: "harmful" };
  }

  if (emergency) {
    return { kind: "emergency", text: redactedText, category: emergency.category, ruleId: emergency.ruleId };
  }

  // 3. Prompt injection: strip the override phrases and keep any genuine question.
  let cleaned = redactedText;
  for (const p of INJECTION) cleaned = cleaned.replace(p, " ");
  cleaned = cleaned.replace(/\s{2,}/g, " ").replace(/^[\s,.;:!-]+/, "").trim();
  const injectionStripped = cleaned !== redactedText.replace(/\s{2,}/g, " ").trim();

  if (injectionStripped && !hasLetters(cleaned)) {
    return { kind: "refuse", text: redactedText, reason: "injection-only" };
  }

  return { kind: "ok", text: injectionStripped ? cleaned : redactedText, injectionStripped, redacted };
}
