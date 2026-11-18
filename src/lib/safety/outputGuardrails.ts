/**
 * Post-generation checks (PLAN.md section 11): scan the model's own output
 * for diagnostic or prescriptive wording.
 *
 * Because replies stream, text is released to the user one complete sentence
 * at a time, and only after that sentence passes. If a sentence fails, nothing
 * further is sent and the caller replaces the reply with a safe fallback.
 */

export type GuardVerdict = { ok: true } | { ok: false; reason: string };

const DISEASES = [
  "dengue",
  "malaria",
  "tuberculosis",
  "tb",
  "diabetes",
  "diabetic",
  "hypertension",
  "high blood pressure",
  "high bp",
  "heart disease",
  "heart attack",
  "cancer",
  "covid(?:-19)?",
  "corona",
  "typhoid",
  "chikungunya",
  "jaundice",
  "hepatitis(?: [a-e])?",
  "pneumonia",
  "asthma",
  "anou?emia",
  "flu",
  "influenza",
  "an? (?:infection|disease|illness|condition|virus)",
].join("|");

const DRUGS = [
  "paracetamol",
  "acetaminophen",
  "dolo(?:[ -]?650)?",
  "crocin",
  "calpol",
  "ibuprofen",
  "brufen",
  "aspirin",
  "diclofenac",
  "nimesulide",
  "antibiotics?",
  "amoxicillin",
  "azithromycin",
  "ciprofloxacin",
  "doxycycline",
  "metformin",
  "insulin",
  "chloroquine",
  "artemether",
  "primaquine",
  "steroids?",
  "painkillers?",
].join("|");

// A sentence that is declining, hedging, conditional or negated is not a claim.
const SAFE_CONTEXT =
  /\b(?:cannot|can't|cant|can not|unable|not able|won't|do not|don't|never|avoid|should not|shouldn't|without|not to|whether|consult|ask (?:a|your|the) (?:doctor|pharmacist)|speak to|talk to|check with|see a doctor|only a (?:doctor|qualified))\b/i;
const CONDITIONAL_START = /^\W*(?:if|when|whenever|once|in case|suppose|unless|should|do|does|did|can|could|would|is|are)\b/i;
const CONDITIONAL_ANY = /\b(?:if|when|whenever|in case|suppose|unless|whether)\s+(?:you|your)\b/i;

const DIAGNOSTIC: [string, RegExp][] = [
  [
    "diagnosis-statement",
    new RegExp(
      `\\byou(?:'ve| have|'re| are)?\\s*(?:(?:most |very |quite )?(?:probably|likely|definitely|certainly|clearly|possibly|may|might|could)\\s+)?(?:have|has|got|suffer(?:ing)? from|infected with|diagnosed with|showing signs of)\\s+(?:an?\\s+|the\\s+)?(?:${DISEASES})\\b(?!\\s+(?:symptoms?|signs?|risk|vaccine|vaccination|prevention|test|testing|awareness))`,
      "i"
    ),
  ],
  ["this-confirms", /\bthis (?:means|confirms|indicates|proves|shows) (?:that )?you (?:have|are|suffer)\b/i],
  ["your-diagnosis", /\byour (?:diagnosis|test results? (?:show|confirm|indicate))\b/i],
  ["you-are-diagnosed", /\byou (?:are|have been|were) diagnosed\b/i],
  ["i-diagnose", /\bi (?:can |will |do )?(?:diagnose|confirm that you)\b/i],
  [
    "hindi-diagnosis",
    new RegExp(
      "आपको\\s+(?:\\S+\\s+){0,2}?(?:डेंगू|मलेरिया|टीबी|टी\\.बी\\.|तपेदिक|क्षय रोग|मधुमेह|डायबिटीज|उच्च रक्तचाप|हाई बीपी|हृदय रोग|दिल की बीमारी|कैंसर|टाइफाइड|निमोनिया|फ्लू|संक्रमण)\\s*(?:\\S+\\s+){0,2}?(?:है|हुआ है|हो गया है|हो सकता है|होने की संभावना है|हो चुका है)".normalize("NFKC")
    ),
  ],
];

const HINDI_SAFE_CONTEXT = /(?:अगर|यदि|जब|क्या|नहीं|निदान नहीं|डॉक्टर से (?:पूछ|मिल|जांच|सलाह|संपर्क))/;

const PRESCRIPTIVE_ALWAYS: [string, RegExp][] = [
  // Specific strengths are never acceptable, even when phrased cautiously.
  ["dose-strength", /\b\d+(?:\.\d+)?\s?(?:mg|mcg|µg|μg|iu)\b/i],
  ["dose-strength-hi", new RegExp("\\d+\\s?(?:मिलीग्राम|मि\\.ग्रा\\.?|एमजी)".normalize("NFKC"))],
];

const PRESCRIPTIVE_CONTEXTUAL: [string, RegExp][] = [
  ["dose-volume", /\b\d+(?:\.\d+)?\s?ml\b.{0,60}\b(?:syrup|dose|dosage|medicine|medication|drops?)\b|\b(?:syrup|dose|dosage|medicine|medication|drops?)\b.{0,60}\b\d+(?:\.\d+)?\s?ml\b/i],
  ["take-n-tablets", /\b(?:take|give|have|swallow|consume|use|administer)\s+(?:\d+|one|two|three|four|half|a|an|1\/2)\s+(?:tablets?|capsules?|pills?|tabs?|drops?)\b/i],
  ["drug-frequency", new RegExp(`\\b(?:${DRUGS})\\b[^.]{0,60}\\b(?:every \\d+ hours?|once|twice|thrice|\\d+ times)\\b`, "i")],
  [
    "you-should-take",
    new RegExp(
      `\\b(?:you (?:should|must|need to|can|could|may|have to)|i (?:recommend|suggest|advise)(?: that you)?|just|simply)\\s+(?:take|taking|use|using|start|starting)\\s+(?:the\\s+|some\\s+|an?\\s+)?(?:${DRUGS}|medicines?|medications?|tablets?|pills?)\\b`,
      "i"
    ),
  ],
  ["take-drug", new RegExp(`\\b(?:take|taking|use|using)\\s+(?:the\\s+|some\\s+|an?\\s+)?(?:${DRUGS})\\b`, "i")],
  ["i-prescribe", /\bi (?:prescribe|would prescribe|recommend (?:taking|you take))\b/i],
  ["recommended-dose", /\bthe (?:recommended |correct |right |usual |standard |adult |child(?:ren'?s)? )?(?:dose|dosage) (?:is|of|for)\b/i],
  [
    "hindi-drug",
    new RegExp(
      "(?:पैरासिटामोल|डोलो|क्रोसिन|इबुप्रोफेन|एस्पिरिन|एंटीबायोटिक|एज़िथ्रोमाइसिन|मेटफॉर्मिन)[^।.]{0,30}(?:लें|खाएं|खाइए|खा सकते|ले सकते|\\d+\\s*(?:गोली|टैबलेट|कैप्सूल))".normalize("NFKC")
    ),
  ],
];

/** Checks one sentence of model output. */
export function checkSentence(sentence: string): GuardVerdict {
  const s = sentence.normalize("NFKC").replace(/\s+/g, " ").trim();
  if (!s) return { ok: true };

  for (const [reason, p] of PRESCRIPTIVE_ALWAYS) if (p.test(s)) return { ok: false, reason };

  const hedged = SAFE_CONTEXT.test(s);
  const conditional = CONDITIONAL_START.test(s) || CONDITIONAL_ANY.test(s);
  const hindiHedged = HINDI_SAFE_CONTEXT.test(s);

  if (!hedged && !conditional) {
    for (const [reason, p] of PRESCRIPTIVE_CONTEXTUAL) if (p.test(s)) return { ok: false, reason };
  }
  if (!hedged && !conditional && !hindiHedged) {
    for (const [reason, p] of DIAGNOSTIC) if (p.test(s)) return { ok: false, reason };
  } else if (!hedged && !conditional) {
    // English diagnostic patterns still apply when only the Hindi hedge matched.
    for (const [reason, p] of DIAGNOSTIC) if (reason !== "hindi-diagnosis" && p.test(s)) return { ok: false, reason };
  }
  return { ok: true };
}

const BOUNDARY = /[.!?।]["')\]]*(?:\s+|$)|\n+/g;
const MAX_HOLD = 700; // never hold back more than this many characters

/**
 * Buffers streamed tokens, releasing only complete sentences that passed.
 * Usage: push() each token; when it returns `blocked`, stop and use a fallback.
 * Call flush() at the end of the stream.
 */
export class OutputGate {
  private buffer = "";
  private blockedReason: string | null = null;

  get blocked() {
    return this.blockedReason;
  }

  private release(text: string): { emit: string; blocked?: string } {
    if (!text) return { emit: "" };
    const sentences = text.split(/(?<=[.!?।]["')\]]*)\s+|\n+/);
    for (const sentence of sentences) {
      const verdict = checkSentence(sentence);
      if (!verdict.ok) {
        this.blockedReason = verdict.reason;
        return { emit: "", blocked: verdict.reason };
      }
    }
    return { emit: text };
  }

  push(token: string): { emit: string; blocked?: string } {
    if (this.blockedReason) return { emit: "", blocked: this.blockedReason };
    this.buffer += token;

    let cut = 0;
    BOUNDARY.lastIndex = 0;
    for (let m = BOUNDARY.exec(this.buffer); m; m = BOUNDARY.exec(this.buffer)) {
      cut = m.index + m[0].length;
    }
    // Guard against unbroken text: release up to the last space.
    if (cut === 0 && this.buffer.length > MAX_HOLD) cut = Math.max(this.buffer.lastIndexOf(" "), 0);
    if (cut === 0) return { emit: "" };

    const ready = this.buffer.slice(0, cut);
    this.buffer = this.buffer.slice(cut);
    return this.release(ready);
  }

  flush(): { emit: string; blocked?: string } {
    if (this.blockedReason) return { emit: "", blocked: this.blockedReason };
    const rest = this.buffer;
    this.buffer = "";
    return this.release(rest);
  }
}
