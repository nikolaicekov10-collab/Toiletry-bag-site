export const CONSENT_VERSION = "2026-10-19";
export const CONSENT_KEY = "nikkys-cookie-consent";
export const VISITOR_KEY = "nikkys-visitor-id";
export const VISITOR_EXPIRY_KEY = "nikkys-visitor-expires";
export const CONSENT_LIFETIME = 180 * 24 * 60 * 60 * 1000;
export type CookieChoice = { version: string; analytics: boolean; updatedAt: number };
export function readChoice(raw: string | null, now = Date.now()): CookieChoice | null {
  try {
    const choice = JSON.parse(raw ?? "null");
    return choice && choice.version === CONSENT_VERSION && typeof choice.analytics === "boolean" &&
      typeof choice.updatedAt === "number" && choice.updatedAt <= now && now - choice.updatedAt < CONSENT_LIFETIME
      ? choice : null;
  } catch { return null; }
}
