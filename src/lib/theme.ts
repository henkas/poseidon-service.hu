export const THEME_STORAGE_KEY = "poseidon_theme";
export const DEFAULT_THEME = "light";

export function getThemeBootstrapScript() {
  return `(() => {
    const storageKey = ${JSON.stringify(THEME_STORAGE_KEY)};
    const defaultTheme = ${JSON.stringify(DEFAULT_THEME)};
    const darkQuery = "(prefers-color-scheme: dark)";

    let theme = defaultTheme;

    try {
      const storedTheme = localStorage.getItem(storageKey);

      if (storedTheme === "light" || storedTheme === "dark") {
        theme = storedTheme;
      } else if (window.matchMedia(darkQuery).matches) {
        theme = "dark";
      }
    } catch (_error) {
      if (window.matchMedia(darkQuery).matches) {
        theme = "dark";
      }
    }

    document.documentElement.dataset.theme = theme;
  })();`;
}
