export type { Locale } from "../data/site";

export const LOCALE_COOKIE_NAME = "poseidon_locale";

const BOT_PATTERN = /bot|crawler|spider|slurp|bingpreview/i;

export function normalizeLocaleCookie(value: string | null): Locale | undefined {
  if (value === "hu" || value === "en") {
    return value;
  }

  return undefined;
}

export function getLocaleCookie(headers: Headers): Locale | null {
  const header = headers.get("cookie");

  if (!header) {
    return null;
  }

  for (const pair of header.split(";")) {
    const [rawName, ...rawValue] = pair.trim().split("=");

    if (rawName !== LOCALE_COOKIE_NAME) {
      continue;
    }

    return normalizeLocaleCookie(rawValue.join("=") || null) ?? null;
  }

  return null;
}

export function localeCookieValue(locale: Locale): string {
  return `${LOCALE_COOKIE_NAME}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function resolveLocaleRequest(input: {
  pathname: string;
  country: string | null;
  cookieLocale: Locale | null;
  userAgent: string | null;
}): { locale: Locale; redirectTo: string | null } {
  const cookieLocale = normalizeLocaleCookie(input.cookieLocale);

  if (input.pathname === "/en/" || input.pathname === "/en") {
    return { locale: "en", redirectTo: null };
  }

  if (input.pathname !== "/") {
    return { locale: "hu", redirectTo: null };
  }

  if (BOT_PATTERN.test(input.userAgent ?? "")) {
    return { locale: "hu", redirectTo: null };
  }

  const preferredLocale =
    cookieLocale ?? (input.country === "HU" ? "hu" : "en");

  if (preferredLocale === "en") {
    return { locale: "en", redirectTo: "/en/" };
  }

  return { locale: "hu", redirectTo: null };
}
