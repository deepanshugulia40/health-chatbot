import { PDFParse } from "pdf-parse";

export type FileKind = "pdf" | "txt";

/** Detects the real file type from content (not just the file name). */
export function detectKind(buf: Buffer, fileName: string): FileKind | null {
  if (buf.subarray(0, 5).toString("latin1") === "%PDF-") return "pdf";
  if (/\.(txt|md)$/i.test(fileName) && !buf.subarray(0, 4096).includes(0)) return "txt";
  return null;
}

/** Returns text per page (a single entry for plain text files). */
export async function extractPages(buf: Buffer, kind: FileKind): Promise<string[]> {
  if (kind === "txt") return [buf.toString("utf8")];

  const parser = new PDFParse({ data: new Uint8Array(buf) });
  try {
    const result = await parser.getText();
    return result.pages.map((p) => p.text);
  } finally {
    await parser.destroy().catch(() => {});
  }
}
