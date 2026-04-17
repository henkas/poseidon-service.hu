import type { Locale } from "./locale-routing";

const HU_TO_EN_HASH: Record<string, string> = {
  rolunk: "about",
  szolgaltatasok: "services",
  referenciak: "references",
  kapcsolat: "contact"
};

const EN_TO_HU_HASH = Object.fromEntries(
  Object.entries(HU_TO_EN_HASH).map(([hu, en]) => [en, hu])
) as Record<string, string>;

export function getLocaleFromPathname(pathname: string): Locale {
  return pathname.startsWith("/en") ? "en" : "hu";
}

export function mapLocaleHash(hash: string, fromLocale: Locale, toLocale: Locale): string {
  const token = hash.replace(/^#/, "").trim();

  if (!token || fromLocale === toLocale) {
    return token ? `#${token}` : "";
  }

  const sourceMap = fromLocale === "hu" ? HU_TO_EN_HASH : EN_TO_HU_HASH;
  const mapped = sourceMap[token] ?? token;

  return `#${mapped}`;
}

export function buildLocaleSwitchHref(input: {
  currentPathname: string;
  currentHash: string;
  targetHref: string;
}): string {
  const fromLocale = getLocaleFromPathname(input.currentPathname);
  const toLocale = getLocaleFromPathname(input.targetHref);
  const mappedHash = mapLocaleHash(input.currentHash, fromLocale, toLocale);

  if (!mappedHash) {
    return input.targetHref;
  }

  const [pathOnly] = input.targetHref.split("#");

  return `${pathOnly}${mappedHash}`;
}
