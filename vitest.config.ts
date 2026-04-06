import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const repoRoot = __dirname;
const frontendRoot = path.resolve(repoRoot, "frontend");

export default defineConfig({
  root: frontendRoot,
  publicDir: path.resolve(repoRoot, "public"),
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    passWithNoTests: true,
  },
  resolve: {
    alias: { "@": path.resolve(frontendRoot, "src") },
  },
});
