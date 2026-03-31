import { describe, expect, it } from "vitest";
import siteContent from "../src/data/site";

describe("site content", () => {
  it("defines partner brand, theme controls, and business-focused hero copy", () => {
    expect(siteContent.hu.partnerCompany.name).toBe("TOP-CLEAN 87' Kft.");
    expect(siteContent.en.partnerCompany.name).toBe("TOP-CLEAN 87' Kft.");

    expect(siteContent.hu.themeToggle.label).toBeTruthy();
    expect(siteContent.hu.themeToggle.light).toBeTruthy();
    expect(siteContent.hu.themeToggle.dark).toBeTruthy();
    expect(siteContent.en.themeToggle.label).toBeTruthy();
    expect(siteContent.en.themeToggle.light).toBeTruthy();
    expect(siteContent.en.themeToggle.dark).toBeTruthy();

    expect(siteContent.hu.hero.title).toMatch(/vállalat|létesítmény|intézmény/i);
    expect(siteContent.en.hero.title).toMatch(/industrial|office|healthcare|facility/i);
  });
});
