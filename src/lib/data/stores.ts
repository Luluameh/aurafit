/** Display name of the sample shop. Real embeds can pass their own name. */
export const DEMO_BRAND_NAME = "Atelier North";

export function brandFromStore(store?: string | null): string {
  const value = store?.trim();
  if (!value || value === "demo" || value === "demo-atelier") return DEMO_BRAND_NAME;
  if (value.includes(" ")) return value.slice(0, 80);
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .slice(0, 80);
}
