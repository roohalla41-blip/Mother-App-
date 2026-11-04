import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/Mother-App-/",
  plugins: [react()],
  server: { host: "0.0.0.0" },
  build: { sourcemap: false }
});
