import { defineConfig } from "vite-plus";
import path from "path";

export default defineConfig({
  base: "./",
  root: path.resolve(__dirname, "src/web"),
  build: {
    outDir: path.resolve(__dirname, "dist-web"),
    emptyOutDir: false,
  },
});
