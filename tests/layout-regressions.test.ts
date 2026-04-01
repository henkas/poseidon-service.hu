import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const tokensCss = readFileSync(new URL("../src/styles/tokens.css", import.meta.url), "utf8");
const globalCss = readFileSync(new URL("../src/styles/global.css", import.meta.url), "utf8");
const partnerSection = readFileSync(
  new URL("../src/components/home/PartnerSection.astro", import.meta.url),
  "utf8"
);

describe("homepage layout regressions", () => {
  it("widens the desktop content shell for the redesigned homepage", () => {
    expect(tokensCss).toContain("--content-width: 85rem;");
  });

  it("keeps partner section layout rules centralized in global styles", () => {
    expect(partnerSection).not.toContain("<style>");
  });

  it("gives the partner card a stable responsive layout and visible CTA styling", () => {
    expect(globalCss).toContain(".partner-card-copy");
    expect(globalCss).toContain(".partner-card .button-secondary");
    expect(globalCss).toContain("grid-template-columns: minmax(0, 1fr) auto;");
    expect(globalCss).toContain("min-height: auto;");
  });
});
