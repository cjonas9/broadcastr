import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { API_CONFIG } from "./src/config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: API_CONFIG.baseUrl,
        changeOrigin: true,
        secure: false,
      },
    },
  },
}); 