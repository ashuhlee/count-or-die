import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  lint: {
    plugins: ["oxc", "typescript", "unicorn", "react"],
    categories: {
      correctness: "warn",
    },
    env: {
      builtin: true,
    },
    options: {},
  },
  fmt: {
    tabWidth: 2,
    useTabs: false,
    printWidth: 80,
    sortPackageJson: false,
    ignorePatterns: ["dist/", ".vite/", "node_modules/"],
  },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["tests/**/*.test.ts", "src/**/*.test.ts"],
    exclude: ["node_modules/**", "out/**", ".vite/**"],
    setupFiles: ["vitest-localstorage-mock"],
    mockReset: false,
    restoreMocks: true,
  },
});
