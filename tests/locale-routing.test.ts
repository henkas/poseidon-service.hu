import { describe, expect, it } from "vitest";
import {
  normalizeLocaleCookie,
  resolveLocaleRequest
} from "../src/lib/locale-routing";

describe("normalizeLocaleCookie", () => {
  it("accepts only hu and en", () => {
    expect(normalizeLocaleCookie("hu")).toBe("hu");
    expect(normalizeLocaleCookie("en")).toBe("en");
    expect(normalizeLocaleCookie("fr")).toBeUndefined();
  });
});

describe("resolveLocaleRequest", () => {
  it("keeps explicit /en/ paths English", () => {
    expect(
      resolveLocaleRequest({
        pathname: "/en/",
        country: "HU",
        cookieLocale: undefined,
        userAgent: "Mozilla/5.0"
      })
    ).toEqual({ locale: "en", redirectTo: null });
  });

  it("redirects first-time non-Hungarian visitors from / to /en/", () => {
    expect(
      resolveLocaleRequest({
        pathname: "/",
        country: "US",
        cookieLocale: undefined,
        userAgent: "Mozilla/5.0"
      })
    ).toEqual({ locale: "en", redirectTo: "/en/" });
  });

  it("keeps bots on / on the Hungarian canonical route", () => {
    expect(
      resolveLocaleRequest({
        pathname: "/",
        country: "US",
        cookieLocale: undefined,
        userAgent: "Googlebot/2.1"
      })
    ).toEqual({ locale: "hu", redirectTo: null });
  });

  it("prefers the locale cookie over country detection", () => {
    expect(
      resolveLocaleRequest({
        pathname: "/",
        country: "HU",
        cookieLocale: "en",
        userAgent: "Mozilla/5.0"
      })
    ).toEqual({ locale: "en", redirectTo: "/en/" });
  });

  it("normalizes invalid cookies before routing", () => {
    expect(
      resolveLocaleRequest({
        pathname: "/",
        country: "HU",
        cookieLocale: normalizeLocaleCookie("fr"),
        userAgent: "Mozilla/5.0"
      })
    ).toEqual({ locale: "hu", redirectTo: null });
  });
});
