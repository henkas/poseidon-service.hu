export type Locale = "hu" | "en";

const BOT_PATTERN = /bot|crawler|spider|slurp|bingpreview/i;

export function resolveLocaleRoute(input: {
  pathname: string;
  country?: string;
  cookieLocale?: string;
  userAgent?: string;
}): { locale: Locale; redirectTo?: string } {
  const cookieLocale = normalizeLocaleCookie(input.cookieLocale);

  if (input.pathname === "/en/" || input.pathname === "/en") {
    return { locale: "en" };
  }

  if (input.pathname !== "/") {
    return { locale: "hu" };
  }

  if (BOT_PATTERN.test(input.userAgent ?? "")) {
    return { locale: "hu" };
  }

  const preferredLocale =
    cookieLocale ?? (input.country === "HU" ? "hu" : "en");

  if (preferredLocale === "en") {
    return { locale: "en", redirectTo: "/en/" };
  }

  return { locale: "hu" };
}

function normalizeLocaleCookie(value?: string): Locale | undefined {
  if (value === "hu" || value === "en") {
    return value;
  }

  return undefined;
}
