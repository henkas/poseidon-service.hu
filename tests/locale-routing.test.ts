import { describe, expect, it } from "vitest";
import {
  getLocaleCookie,
  localeCookieValue,
  normalizeLocaleCookie,
  resolveLocaleRequest
} from "../src/lib/locale-routing";

describe("normalizeLocaleCookie", () => {
  it("accepts only hu and en", () => {
    expect(normalizeLocaleCookie("hu")).toBe("hu");
    expect(normalizeLocaleCookie("en")).toBe("en");
    expect(normalizeLocaleCookie(null)).toBeUndefined();
    expect(normalizeLocaleCookie("fr")).toBeUndefined();
  });
});

describe("middleware-facing locale cookie helpers", () => {
  it("reads poseidon_locale=en from a cookie header string", () => {
    const headers = new Headers({
      cookie: "session=abc; poseidon_locale=en; theme=dark"
    });

    expect(getLocaleCookie(headers)).toBe("en");
  });

  it("formats a locale cookie value for set-cookie", () => {
    expect(localeCookieValue("hu")).toContain("poseidon_locale=hu");
    expect(localeCookieValue("hu")).toContain("Path=/");
  });
});

describe("resolveLocaleRequest", () => {
  it("keeps explicit /en/ paths English", () => {
    expect(
      resolveLocaleRequest({
        pathname: "/en/",
        country: null,
        cookieLocale: null,
        userAgent: null
      })
    ).toEqual({ locale: "en", redirectTo: null });
  });

  it("redirects first-time non-Hungarian visitors from / to /en/", () => {
    expect(
      resolveLocaleRequest({
        pathname: "/",
        country: "US",
        cookieLocale: null,
        userAgent: null
      })
    ).toEqual({ locale: "en", redirectTo: "/en/" });
  });

  it("keeps bots on / on the Hungarian canonical route", () => {
    expect(
      resolveLocaleRequest({
        pathname: "/",
        country: "US",
        cookieLocale: null,
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
        userAgent: null
      })
    ).toEqual({ locale: "en", redirectTo: "/en/" });
  });

  it("normalizes invalid cookies before routing", () => {
    expect(normalizeLocaleCookie("fr")).toBeUndefined();

    expect(
      resolveLocaleRequest({
        pathname: "/",
        country: "HU",
        cookieLocale: null,
        userAgent: null
      })
    ).toEqual({ locale: "hu", redirectTo: null });
  });
});
