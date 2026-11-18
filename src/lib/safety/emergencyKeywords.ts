/**
 * Emergency detection (PLAN.md 4.6). Runs on every user message BEFORE the
 * LLM. Deliberately keyword/pattern based and biased towards over-triggering:
 * showing emergency guidance to someone who did not need it is cheap, missing
 * a real emergency is not.
 *
 * Covers English, Hindi (Devanagari) and romanised Hindi ("Hinglish").
 */

export type EmergencyCategory = "medical" | "mental-health";

export type EmergencyMatch = { category: EmergencyCategory; ruleId: string };

/** Lowercases and canonicalises text so patterns match reliably. */
export function normalizeForMatching(input: string): string {
  return input
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[​-‍⁠﻿]/g, "") // zero-width characters
    .replace(/[‘’ʼ`´]/g, "'") // curly apostrophes
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

// Source strings are NFKC-normalised too, so Devanagari (nukta etc.) forms
// match the normalised input regardless of how they were typed here.
const rx = (src: string) => new RegExp(src.normalize("NFKC"), "i");
// Latin-script words: avoid matching inside longer words.
const latin = (src: string) => rx(`(?<![a-z])(?:${src})(?![a-z])`);

type Rule = { id: string; category: EmergencyCategory; pattern: RegExp };

const MENTAL: Rule[] = [
  {
    id: "en-suicide",
    category: "mental-health",
    pattern: latin(
      [
        "suicid(?:e|al)",
        "kill(?:ing)? my ?self",
        "end(?:ing)? (?:my|my own) life",
        "end(?:ing)? it all",
        "end(?:ing)? everything",
        "take my (?:own )?life",
        "want(?:ed|s)? to die",
        "wanna die",
        "wish i (?:was|were) dead",
        "(?:don't|do not|dont) want to (?:live|be alive|exist)",
        "better off dead",
        "better off without me",
        "no reason to live",
        "self[- ]?harm(?:ing)?",
        "harm(?:ing)? my ?self",
        "hurt(?:ing)? my ?self",
        "cut(?:ting)? my ?self",
        "hang(?:ing)? my ?self",
        "(?:lethal|fatal|deadly) dose",
        "how many (?:pills|tablets)\\b.{0,30}\\b(?:die|kill|overdose)",
        "jump(?:ing)? (?:off|from) (?:a |the )?(?:bridge|building|roof|terrace)",
      ].join("|")
    ),
  },
  {
    id: "hi-suicide",
    category: "mental-health",
    pattern: rx(
      [
        "आत्म-?हत्या",
        "आत्मघात",
        "मरना चाहता",
        "मरना चाहती",
        "मर जाना चाहता",
        "मर जाना चाहती",
        "मर जाऊं",
        "मर जाऊँ",
        "जीना नहीं चाहता",
        "जीना नहीं चाहती",
        "जीने की इच्छा नहीं",
        "जान दे (?:दूं|दूँ|दूंगा|दूंगी)",
        "खुद को (?:खत्म|ख़त्म|मार|नुकसान|चोट)",
        "(?:जिंदगी|ज़िंदगी|जिन्दगी) (?:खत्म|ख़त्म)",
      ].join("|")
    ),
  },
  {
    id: "hinglish-suicide",
    category: "mental-health",
    pattern: latin(
      [
        "aatm ?hatya",
        "atma ?hatya",
        "marna chah(?:ta|ti)",
        "mar jana chah(?:ta|ti)",
        "mar jaunga",
        "mar jaungi",
        "jeena nahi chah(?:ta|ti)",
        "jaan de (?:dunga|dungi|du)",
        "khud ko (?:khatam|maar|nuksan|hurt)",
        "zindagi khatam",
        "jine ka mann nahi",
      ].join("|")
    ),
  },
];

const MEDICAL: Rule[] = [
  {
    id: "en-cardiac",
    category: "medical",
    pattern: latin(
      [
        "chest (?:pain|pains|tightness|pressure|discomfort)",
        "(?:pain|tightness|pressure) in (?:my |the )?chest",
        "heart attack",
        "cardiac arrest",
      ].join("|")
    ),
  },
  {
    id: "en-breathing",
    category: "medical",
    pattern: latin(
      [
        "(?:can't|cant|cannot|can not|unable to|couldn't|could not) (?:breathe|breath)",
        "(?:not|no longer|stopped|stops) breathing",
        "struggling to breathe",
        "gasping(?: for (?:air|breath))?",
        "(?:difficulty|trouble|hard time|hard to) (?:in )?breath(?:e|ing)",
        "short(?:ness)? of breath",
        "breathless(?:ness)?",
      ].join("|")
    ),
  },
  {
    id: "en-bleeding",
    category: "medical",
    pattern: latin(
      [
        "(?:severe|heavy|profuse|excessive|uncontrolled|serious) bleeding",
        "bleeding (?:heavily|profusely|a lot|badly|non ?stop|nonstop)",
        "(?:won't|wont|will not|doesn't|doesnt|not) stop bleeding",
        "bleeding (?:won't|wont|doesn't|doesnt|will not) stop",
        "bleeding (?:during|while) pregnan\\w*",
        "pregnan\\w* (?:and )?bleeding",
      ].join("|")
    ),
  },
  {
    id: "en-blood-bodily",
    category: "medical",
    pattern: latin(
      [
        "(?:coughing|cough|vomiting|vomit|spitting|throwing up|passing|pass) (?:up )?blood",
        "blood in (?:my |the )?(?:vomit|stool|urine|cough|sputum)",
      ].join("|")
    ),
  },
  {
    id: "en-consciousness",
    category: "medical",
    pattern: latin(
      [
        "unconscious",
        "unresponsive",
        "not responding",
        "passed out",
        "fainted",
        "collapsed",
        "not waking up",
        "(?:won't|wont|will not) wake up",
      ].join("|")
    ),
  },
  {
    id: "en-seizure-stroke",
    category: "medical",
    pattern: latin(
      [
        "seizures?",
        "convuls\\w*",
        "having a fit",
        "strokes?",
        "face (?:is )?(?:drooping|droop\\w*)",
        "slurred speech",
        "(?:sudden|one[- ]sided) (?:weakness|numbness|paralysis)",
        "worst headache",
        "sudden severe headache",
      ].join("|")
    ),
  },
  {
    id: "en-poison-choking",
    category: "medical",
    pattern: latin(
      [
        "choking",
        "poison(?:ed|ing)?",
        "overdos(?:e|ed|ing)",
        "(?:swallowed|drank|ate|consumed) (?:phenyl|kerosene|pesticide|bleach|acid|rat poison|too many (?:pills|tablets))",
        "snake ?bite",
        "bitten by (?:a )?snake",
        "snake bit",
      ].join("|")
    ),
  },
  {
    id: "en-allergy-injury",
    category: "medical",
    pattern: latin(
      [
        "anaphyla\\w*",
        "(?:severe|serious) allergic reaction",
        "throat (?:is )?(?:closing|swelling)",
        "swelling (?:of|in) (?:my )?(?:throat|tongue|face)",
        "(?:severe|serious|major|bad) (?:burns?|head injury|accident)",
        "burnt badly",
      ].join("|")
    ),
  },
  {
    id: "hi-medical",
    category: "medical",
    pattern: rx(
      [
        "(?:सीने|छाती) में (?:\\S+ ){0,2}(?:दर्द|जकड़न|भारीपन|दबाव)",
        "दिल का दौरा",
        "हार्ट अटैक",
        "हृदयघात",
        "(?:सांस|साँस) (?:नहीं|ना) (?:आ|ले)",
        "(?:सांस|साँस) लेने में (?:तकलीफ|दिक्कत|परेशानी|कठिनाई)",
        "दम घुट",
        "(?:बहुत|ज्यादा|ज़्यादा|अधिक) खून (?:बह|निकल)",
        "खून (?:बह रहा|नहीं रुक|बंद नहीं)",
        "(?:खून की उल्टी|उल्टी में खून|खांसी में खून|खाँसी में खून)",
        "बेहोश",
        "होश (?:में )?नहीं",
        "दौरा पड़",
        "मिर्गी",
        "लकवा",
        "पक्षाघात",
        "ज़हर|जहर",
        "(?:सांप|साँप) (?:ने )?(?:काट|डस)",
      ].join("|")
    ),
  },
  {
    id: "hinglish-medical",
    category: "medical",
    pattern: latin(
      [
        "seene (?:mein|me|mai) (?:\\w+ ){0,2}(?:dard|jakdan|bhaari|bhari)",
        "chh?ati (?:mein|me|mai) (?:\\w+ ){0,2}(?:dard|jakdan)",
        "dil ka daura",
        "saans (?:nahi|nhi|na) (?:aa|aa raha|aati|le)",
        "saans lene (?:mein|me|mai) (?:takleef|dikkat|problem|pareshani)",
        "dam ghut\\w*",
        "khoon (?:band )?(?:nahi|nhi) (?:ruk|ruka|rukh)",
        "bahut khoon",
        "behosh\\w*",
        "hosh (?:mein )?(?:nahi|nhi)",
        "daura pad\\w*",
        "lakwa",
        "zeher\\w*",
        "jahar (?:kha|pi)\\w*",
        "s(?:aa|a)np (?:ne )?kat\\w*",
        "khoon ki ulti",
        "ulti (?:mein|me) khoon",
      ].join("|")
    ),
  },
];

// Mental-health rules come first: a crisis message gets crisis guidance even
// if it also mentions a medical term (e.g. an overdose).
const RULES: Rule[] = [...MENTAL, ...MEDICAL];

export function detectEmergency(text: string): EmergencyMatch | null {
  const normalized = normalizeForMatching(text);
  for (const rule of RULES) {
    if (rule.pattern.test(normalized)) return { category: rule.category, ruleId: rule.id };
  }
  return null;
}
