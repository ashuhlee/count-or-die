import type { MenuItemConstructorOptions } from "electron";

export function createViewMenu(
  isPackaged: boolean,
): MenuItemConstructorOptions {
  if (isPackaged) {
    return { label: "View", submenu: [{ role: "togglefullscreen" }] };
  }

  return {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { role: "toggleDevTools" },
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" },
    ],
  };
}
