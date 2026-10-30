import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** Offline bundle packed inside the Android APK. Not used by the web preview. */
export default defineConfig({
  root: fileURLToPath(new URL("./apk-web", import.meta.url)),
  base: "./",
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: fileURLToPath(new URL("./android/app/src/main/assets", import.meta.url)),
    emptyOutDir: true,
    assetsDir: "pack",
    cssCodeSplit: false,
    sourcemap: false,
    chunkSizeWarningLimit: 2500,
  },
});
