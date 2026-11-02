import { describe, expect, test } from "vite-plus/test";
import type { MenuItemConstructorOptions } from "electron";

import { createViewMenu } from "../../src/main/menu.ts";

const roles = (isPackaged: boolean) =>
  (createViewMenu(isPackaged).submenu as MenuItemConstructorOptions[])
    .map((item) => item.role)
    .filter(Boolean);

describe("the View menu", () => {
  test("has reload, developer tools and zoom while developing", () => {
    expect(roles(false)).toEqual([
      "reload",
      "forceReload",
      "toggleDevTools",
      "resetZoom",
      "zoomIn",
      "zoomOut",
      "togglefullscreen",
    ]);
  });

  test("only has fullscreen in a packaged app", () => {
    expect(roles(true)).toEqual(["togglefullscreen"]);
  });

  test("leaves out the shortcuts for reloading, developer tools and zoom", () => {
    for (const role of [
      "reload",
      "forceReload",
      "toggleDevTools",
      "resetZoom",
      "zoomIn",
      "zoomOut",
    ]) {
      expect(roles(true)).not.toContain(role);
    }
  });
});
