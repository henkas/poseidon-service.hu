import type { Locale } from "../data/site";

type PostalAddress = {
  "@type": "PostalAddress";
  streetAddress: string;
  postalCode: string;
  addressLocality: string;
  addressCountry: string;
};

type Country = {
  "@type": "Country";
  name: string;
};

export type LocalBusinessJsonLd = {
  "@context": "https://schema.org";
  "@type": "CleaningService";
  name: string;
  url: string;
  inLanguage: Locale;
  address: PostalAddress;
  telephone: string[];
  areaServed: Country;
  sameAs: string[];
};

export function buildLocalBusinessJsonLd(input: {
  locale: Locale;
  siteOrigin: URL;
}): LocalBusinessJsonLd {
  const path = input.locale === "en" ? "/en/" : "/";
  return {
    "@context": "https://schema.org",
    "@type": "CleaningService",
    name: "Poseidon Service Kft.",
    url: new URL(path, input.siteOrigin).toString(),
    inLanguage: input.locale,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Berettyó utca 10/1",
      postalCode: "4034",
      addressLocality: "Debrecen",
      addressCountry: "HU"
    },
    telephone: ["+36 20 955 2464", "+36 30 946 0693"],
    areaServed: { "@type": "Country", "name": "Hungary" },
    sameAs: ["https://www.facebook.com/poseidonservice"]
  };
}
