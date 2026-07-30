import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: resolve(__dirname, "portfolio"),
  base: process.env.GITHUB_PAGES === "true" ? "/portfolio/" : "/",
  publicDir: resolve(__dirname, "public"),
  build: {
    outDir: resolve(__dirname, "dist-portfolio"),
    emptyOutDir: true,
  },
  plugins: [react()],
});
