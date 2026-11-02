import { defineConfig } from "vite-plus";

export default defineConfig({
  build: {
    rollupOptions: {
      external: ["electron", "bufferutil", "utf-8-validate"],
    },
  },
});
