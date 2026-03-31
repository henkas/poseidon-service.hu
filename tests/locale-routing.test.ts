import { describe, expect, it } from "vitest";
import { resolveLocaleRoute } from "../src/lib/locale-routing";

describe("resolveLocaleRoute", () => {
  it("keeps explicit /en/ paths English", () => {
    expect(
      resolveLocaleRoute({
        pathname: "/en/",
        country: "HU",
        cookieLocale: undefined,
        userAgent: "Mozilla/5.0"
      })
    ).toEqual({ locale: "en", redirectTo: undefined });
  });

  it("redirects first-time non-Hungarian visitors from / to /en/", () => {
    expect(
      resolveLocaleRoute({
        pathname: "/",
        country: "US",
        cookieLocale: undefined,
        userAgent: "Mozilla/5.0"
      })
    ).toEqual({ locale: "en", redirectTo: "/en/" });
  });

  it("keeps bots on / on the Hungarian canonical route", () => {
    expect(
      resolveLocaleRoute({
        pathname: "/",
        country: "US",
        cookieLocale: undefined,
        userAgent: "Googlebot/2.1"
      })
    ).toEqual({ locale: "hu", redirectTo: undefined });
  });
});
