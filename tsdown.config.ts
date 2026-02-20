import { defineConfig } from "tsdown";

export default defineConfig({
  entry: { index: "./index.ts" },
  outDir: "dist",
  format: ["esm"],
  clean: true,
  dts: false,
  external: ["fs", "path", "node:fs", "node:path"],
});
