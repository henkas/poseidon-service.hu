import { describe, expect, it } from "vitest";
import { buildLocalBusinessJsonLd } from "../src/lib/structured-data";

describe("buildLocalBusinessJsonLd", () => {
  it("includes core LocalBusiness fields for the Hungarian locale", () => {
    const result = buildLocalBusinessJsonLd({
      locale: "hu",
      siteOrigin: new URL("https://poseidon-service.hu")
    });

    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("CleaningService");
    expect(result.name).toBe("Poseidon Service Kft.");
    expect(result.url).toBe("https://poseidon-service.hu/");
    expect(result.inLanguage).toBe("hu");
    expect(result.address).toEqual({
      "@type": "PostalAddress",
      streetAddress: "Berettyó utca 10/1",
      postalCode: "4034",
      addressLocality: "Debrecen",
      addressCountry: "HU"
    });
    expect(result.telephone).toEqual(["+36 20 955 2464", "+36 30 946 0693"]);
    expect(result.areaServed).toEqual({ "@type": "Country", "name": "Hungary" });
    expect(result.sameAs).toContain("https://www.facebook.com/poseidonservice");
  });

  it("switches the url and language for the English locale", () => {
    const result = buildLocalBusinessJsonLd({
      locale: "en",
      siteOrigin: new URL("https://poseidon-service.hu")
    });

    expect(result.url).toBe("https://poseidon-service.hu/en/");
    expect(result.inLanguage).toBe("en");
  });
});
