import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Keep the browser Host header so same-origin checks also work without .env.
    proxy: { "/api": { target: "http://127.0.0.1:3001", changeOrigin: false } },
  },
  build: { outDir: "dist" },
});
