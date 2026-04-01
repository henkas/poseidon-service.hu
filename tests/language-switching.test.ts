import { describe, expect, it } from "vitest";
import {
  buildLocaleSwitchHref,
  getLocaleFromPathname,
  mapLocaleHash
} from "../src/lib/language-switching";

describe("getLocaleFromPathname", () => {
  it("resolves /en routes as English", () => {
    expect(getLocaleFromPathname("/en/")).toBe("en");
    expect(getLocaleFromPathname("/en")).toBe("en");
    expect(getLocaleFromPathname("/en/about")).toBe("en");
  });

  it("resolves non-/en routes as Hungarian", () => {
    expect(getLocaleFromPathname("/")).toBe("hu");
    expect(getLocaleFromPathname("/kapcsolat")).toBe("hu");
  });
});

describe("mapLocaleHash", () => {
  it("maps known Hungarian section hashes to English", () => {
    expect(mapLocaleHash("#szolgaltatasok", "hu", "en")).toBe("#services");
    expect(mapLocaleHash("#kapcsolat", "hu", "en")).toBe("#contact");
  });

  it("maps known English section hashes to Hungarian", () => {
    expect(mapLocaleHash("#references", "en", "hu")).toBe("#referenciak");
    expect(mapLocaleHash("#about", "en", "hu")).toBe("#rolunk");
  });

  it("keeps unknown hashes unchanged", () => {
    expect(mapLocaleHash("#custom-anchor", "hu", "en")).toBe("#custom-anchor");
  });
});

describe("buildLocaleSwitchHref", () => {
  it("adds mapped hash when switching locales", () => {
    expect(
      buildLocaleSwitchHref({
        currentPathname: "/",
        currentHash: "#kapcsolat",
        targetHref: "/en/"
      })
    ).toBe("/en/#contact");
  });

  it("keeps target href clean when no hash exists", () => {
    expect(
      buildLocaleSwitchHref({
        currentPathname: "/en/",
        currentHash: "",
        targetHref: "/"
      })
    ).toBe("/");
  });
});
