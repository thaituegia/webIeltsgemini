import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  resolve: {
    alias: [
      {
        find: "node:crypto",
        replacement: fileURLToPath(
          new URL("./preview/crypto.ts", import.meta.url),
        ),
      },
      {
        find: /^\.\/auth$/,
        replacement: fileURLToPath(
          new URL("./preview/errors.ts", import.meta.url),
        ),
      },
    ],
  },
  build: {
    outDir: ".preview-build",
    emptyOutDir: true,
    target: "es2022",
    lib: {
      entry: fileURLToPath(new URL("./preview/entry.tsx", import.meta.url)),
      name: "IELTSCompassPreview",
      formats: ["iife"],
      fileName: () => "preview.js",
      cssFileName: "preview",
    },
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
