/**
 * Ingestion policy (PLAN.md section 5): content may only come from the
 * approved publishers. We enforce it on the document's sourceUrl host.
 */
export const APPROVED_SOURCE_DOMAINS = ["who.int", "mohfw.gov.in", "nhp.gov.in", "ncdc.mohfw.gov.in"] as const;

export function isApprovedSourceUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  const host = url.hostname.toLowerCase();
  return APPROVED_SOURCE_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
}
