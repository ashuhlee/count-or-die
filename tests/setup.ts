// runs before every test file (see test.setupFiles in vite.config.ts)

// tells React that updates in tests are wrapped in act()
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

// the real value is injected by Vite's `define` at build time
(globalThis as { __APP_VERSION__?: string }).__APP_VERSION__ = "0.0.0-test";
