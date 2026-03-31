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

  it("still falls back to system dark mode when localStorage access fails", () => {
    const script = getThemeBootstrapScript();
    const documentElement = { dataset: {} as Record<string, string> };
    const localStorage = {
      getItem() {
        throw new Error("blocked");
      }
    };
    const window = { matchMedia: () => ({ matches: true }) };

    new Function(
      "window",
      "localStorage",
      "document",
      script
    )(window, localStorage, { documentElement });

    expect(documentElement.dataset.theme).toBe("dark");
  });
});
