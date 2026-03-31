import { describe, expect, it } from "vitest";
import siteContent from "../src/data/site";

describe("site content", () => {
  it("defines the homepage content contract for both locales", () => {
    expect(siteContent.hu.trustStrip.kicker).toBeTruthy();
    expect(siteContent.en.trustStrip.kicker).toBeTruthy();
    expect(siteContent.hu.trustStrip.items.length).toBeGreaterThanOrEqual(3);
    expect(siteContent.hu.trustStrip.items.length).toBeLessThanOrEqual(5);
    expect(siteContent.en.trustStrip.items.length).toBeGreaterThanOrEqual(3);
    expect(siteContent.en.trustStrip.items.length).toBeLessThanOrEqual(5);

    expect(siteContent.hu.partnerCompany).toEqual({
      kicker: expect.any(String),
      title: expect.any(String),
      intro: expect.any(String),
      name: "TOP-CLEAN 87' Kft.",
      href: "https://topclean87kft.hu/",
      cta: expect.any(String)
    });
    expect(siteContent.en.partnerCompany).toEqual({
      kicker: expect.any(String),
      title: expect.any(String),
      intro: expect.any(String),
      name: "TOP-CLEAN 87' Kft.",
      href: "https://topclean87kft.hu/",
      cta: expect.any(String)
    });

    expect(siteContent.hu.partnerCompany.name).toBe("TOP-CLEAN 87' Kft.");
    expect(siteContent.en.partnerCompany.name).toBe("TOP-CLEAN 87' Kft.");

    expect(siteContent.hu.themeToggle.label).toBeTruthy();
    expect(siteContent.hu.themeToggle.light).toBeTruthy();
    expect(siteContent.hu.themeToggle.dark).toBeTruthy();
    expect(siteContent.en.themeToggle.label).toBeTruthy();
    expect(siteContent.en.themeToggle.light).toBeTruthy();
    expect(siteContent.en.themeToggle.dark).toBeTruthy();

    expect(siteContent.hu.contact.people).toHaveLength(2);
    expect(siteContent.en.contact.people).toHaveLength(2);
    expect(siteContent.hu.contact.mailtoSubject).toBeTruthy();
    expect(siteContent.en.contact.mailtoSubject).toBeTruthy();
    expect(siteContent.hu.contact.formLabels.name).toBeTruthy();
    expect(siteContent.hu.contact.formLabels.company).toBeTruthy();
    expect(siteContent.hu.contact.formLabels.email).toBeTruthy();
    expect(siteContent.hu.contact.formLabels.phone).toBeTruthy();
    expect(siteContent.hu.contact.formLabels.message).toBeTruthy();
    expect(siteContent.hu.contact.formLabels.submit).toBeTruthy();
    expect(siteContent.en.contact.formLabels.name).toBeTruthy();
    expect(siteContent.en.contact.formLabels.company).toBeTruthy();
    expect(siteContent.en.contact.formLabels.email).toBeTruthy();
    expect(siteContent.en.contact.formLabels.phone).toBeTruthy();
    expect(siteContent.en.contact.formLabels.message).toBeTruthy();
    expect(siteContent.en.contact.formLabels.submit).toBeTruthy();
    expect(siteContent.hu.contact.mailBodyLabels.name).toBeTruthy();
    expect(siteContent.hu.contact.mailBodyLabels.company).toBeTruthy();
    expect(siteContent.hu.contact.mailBodyLabels.email).toBeTruthy();
    expect(siteContent.hu.contact.mailBodyLabels.phone).toBeTruthy();
    expect(siteContent.hu.contact.mailBodyLabels.message).toBeTruthy();
    expect(siteContent.en.contact.mailBodyLabels.name).toBeTruthy();
    expect(siteContent.en.contact.mailBodyLabels.company).toBeTruthy();
    expect(siteContent.en.contact.mailBodyLabels.email).toBeTruthy();
    expect(siteContent.en.contact.mailBodyLabels.phone).toBeTruthy();
    expect(siteContent.en.contact.mailBodyLabels.message).toBeTruthy();

    expect(siteContent.hu.hero.title).toMatch(/vállalat|létesítmény|intézmény/i);
    expect(siteContent.en.hero.title).toMatch(/industrial|office|healthcare|facility/i);

    expect(siteContent.hu.heroImages.main.alt).toBeTruthy();
    expect(siteContent.en.heroImages.main.alt).toBeTruthy();
    expect(siteContent.hu.heroImages.side).toHaveLength(2);
    expect(siteContent.en.heroImages.side).toHaveLength(2);

    expect(siteContent.hu.pricing.serviceHeader).toBeTruthy();
    expect(siteContent.hu.pricing.priceHeader).toBeTruthy();
    expect(siteContent.en.pricing.serviceHeader).toBeTruthy();
    expect(siteContent.en.pricing.priceHeader).toBeTruthy();
  });
});
