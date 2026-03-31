import { describe, expect, it } from "vitest";
import { THEME_STORAGE_KEY, getThemeBootstrapScript } from "../src/lib/theme";

describe("theme helpers", () => {
  it("uses the persistent poseidon theme storage key", () => {
    expect(THEME_STORAGE_KEY).toBe("poseidon_theme");
  });

  it("boots with the system dark-mode preference fallback", () => {
    expect(getThemeBootstrapScript()).toContain(
      'prefers-color-scheme: dark'
    );
  });
});
