import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "/u-dont-grc-me/" : "/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        portfolio: resolve(__dirname, "portfolio/index.html"),
      },
    },
  },
  plugins: [react()],
});
