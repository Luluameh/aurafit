export const YOUCAM_BASE_URL =
  process.env.YOUCAM_API_BASE_URL ?? "https://yce-api-01.makeupar.com";

export function getYouCamApiKey(): string {
  const key = process.env.YOUCAM_API_KEY;
  if (!key) {
    throw new Error(
      "YOUCAM_API_KEY is not set. Add it to .env.local (see .env.example).",
    );
  }
  return key;
}
