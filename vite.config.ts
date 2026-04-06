import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const repoRoot = __dirname;
const frontendRoot = path.resolve(repoRoot, "frontend");

// https://vitejs.dev/config/
export default defineConfig({
  root: frontendRoot,
  publicDir: path.resolve(repoRoot, "public"),
  build: {
    outDir: path.resolve(repoRoot, "dist"),
    emptyOutDir: true,
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(frontendRoot, "src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
});
