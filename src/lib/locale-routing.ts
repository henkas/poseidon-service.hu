export type Locale = "hu" | "en";

const BOT_PATTERN = /bot|crawler|spider|slurp|bingpreview/i;

export function normalizeLocaleCookie(value?: string): Locale | undefined {
  if (value === "hu" || value === "en") {
    return value;
  }

  return undefined;
}

export function resolveLocaleRequest(input: {
  pathname: string;
  country?: string;
  cookieLocale?: string;
  userAgent?: string;
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
