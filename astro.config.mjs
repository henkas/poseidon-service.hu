import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://poseidon-service.hu",
  output: "server",
  adapter: cloudflare()
});
