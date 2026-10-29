import { defineConfig } from "vite-plus";

export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        "electron",
        "electron-store",
        "electron-squirrel-startup",
        "bufferutil",
        "utf-8-validate",
      ],
    },
  },
});
