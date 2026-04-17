import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://poseidon-service.hu",
  output: "server",
  adapter: cloudflare(),
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "hu",
        locales: {
          hu: "hu-HU",
          en: "en"
        }
      }
    })
  ],
  image: {
    domains: ["cdn.brandfetch.io"]
  }
});
