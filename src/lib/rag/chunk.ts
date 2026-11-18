/**
 * Text cleaning and chunking for the RAG ingestion pipeline.
 * Pure functions (no I/O) so they are easy to test.
 *
 * Token counts are estimated at ~4 characters per token, which is close
 * enough for sizing chunks without shipping a tokenizer.
 */

export const CHARS_PER_TOKEN = 4;
export const CHUNK_TOKENS = 650; // target 500-800
export const OVERLAP_TOKENS = 100;

export const estimateTokens = (s: string) => Math.ceil(s.length / CHARS_PER_TOKEN);

const normalizeLine = (l: string) => l.replace(/\d+/g, "#").replace(/\s+/g, " ").trim().toLowerCase();

/** Cleans per-page extracted text into paragraphs separated by blank lines. */
export function cleanText(pages: string[]): string {
  const pageLines = pages.map((p) =>
    p
      .replace(/\u0000/g, "")
      .replace(/\r\n?/g, "\n")
      .split("\n")
      .map((l) => l.replace(/[ \t]+/g, " ").trim())
  );

  // Headers/footers: short lines that repeat on at least half of the pages.
  const repeated = new Set<string>();
  if (pages.length >= 3) {
    const counts = new Map<string, number>();
    for (const lines of pageLines) {
      for (const key of new Set(lines.filter((l) => l && l.length < 100).map(normalizeLine))) {
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    for (const [key, n] of counts) if (n >= Math.ceil(pages.length * 0.5)) repeated.add(key);
  }

  const isPageNumber = (l: string) => /^(page\s+)?\d{1,4}(\s*(of|\/)\s*\d{1,4})?$/i.test(l);

  const out: string[] = [];
  for (const lines of pageLines) {
    for (const l of lines) {
      if (l && (isPageNumber(l) || repeated.has(normalizeLine(l)))) continue;
      out.push(l);
    }
    out.push(""); // page break acts as a paragraph break
  }

  return out
    .join("\n")
    .replace(/(\w)-\n(\w)/g, "$1$2") // re-join hyphenated line breaks
    .split(/\n{2,}/) // paragraphs
    .map((p) => p.replace(/\s*\n\s*/g, " ").replace(/\s{2,}/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
}

type Unit = { text: string; sep: string };

/** Splits text into units no longer than `limit`, preferring natural boundaries. */
function toUnits(text: string, limit: number): Unit[] {
  const units: Unit[] = [];
  for (const para of text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)) {
    if (para.length <= limit) {
      units.push({ text: para, sep: "\n\n" });
      continue;
    }
    for (const sentence of para.split(/(?<=[.!?।])\s+/)) {
      if (sentence.length <= limit) {
        units.push({ text: sentence, sep: " " });
        continue;
      }
      // Very long run-on text: fall back to word boundaries.
      let buf = "";
      for (const word of sentence.split(/\s+/)) {
        if (buf && buf.length + 1 + word.length > limit) {
          units.push({ text: buf, sep: " " });
          buf = "";
        }
        if (word.length > limit) {
          // A single token longer than a chunk (long URL, unspaced script): hard-slice it.
          for (let i = 0; i < word.length; i += limit) {
            units.push({ text: word.slice(i, i + limit), sep: " " });
          }
        } else {
          buf = buf ? `${buf} ${word}` : word;
        }
      }
      if (buf) units.push({ text: buf, sep: " " });
    }
  }
  return units;
}

/** Last ~`size` characters of `s`, starting on a word boundary. */
function overlapTail(s: string, size: number): string {
  if (size <= 0 || s.length <= size) return size <= 0 ? "" : s;
  const tail = s.slice(s.length - size);
  const firstSpace = tail.search(/\s/);
  return firstSpace === -1 ? tail : tail.slice(firstSpace + 1);
}

export function chunkText(
  text: string,
  opts: { chunkTokens?: number; overlapTokens?: number } = {}
): string[] {
  const maxChars = (opts.chunkTokens ?? CHUNK_TOKENS) * CHARS_PER_TOKEN;
  const overlapChars = (opts.overlapTokens ?? OVERLAP_TOKENS) * CHARS_PER_TOKEN;
  if (overlapChars >= maxChars) throw new Error("overlap must be smaller than the chunk size");

  // Units must leave room for the carried-over overlap and the longest
  // separator (two characters) so a chunk never exceeds maxChars.
  const units = toUnits(text, maxChars - overlapChars - 2);
  const chunks: string[] = [];
  let cur = "";
  let fresh = 0; // characters in `cur` that are not carried-over overlap

  for (const u of units) {
    if (fresh > 0 && cur.length + u.sep.length + u.text.length > maxChars) {
      chunks.push(cur);
      cur = overlapTail(cur, overlapChars);
      fresh = 0;
    }
    cur = cur ? cur + u.sep + u.text : u.text;
    fresh += u.text.length;
  }
  if (cur && fresh > 0) chunks.push(cur);
  return chunks;
}
