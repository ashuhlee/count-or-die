import type { MenuItemConstructorOptions, NativeImage } from "electron";

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

export type GameMenuActions = {
  openChallenges: () => void;
  openHowToPlay: () => void;
  muteSound: () => void;
  toggleMusic: () => void;
  resetProgress: () => void;
};

export type GameMenuIcons = {
  challenges?: NativeImage;
  howToPlay?: NativeImage;
};

export function createGameMenu(
  actions: GameMenuActions,
  icons: GameMenuIcons = {},
): MenuItemConstructorOptions {
  return {
    label: "Game",
    submenu: [
      {
        label: "Daily Challenges",
        icon: icons.challenges,
        click: actions.openChallenges,
      },
      {
        label: "How to Play",
        icon: icons.howToPlay,
        click: actions.openHowToPlay,
      },
      { type: "separator" },
      { label: "Mute Sound", click: actions.muteSound },
      { label: "Toggle Music", click: actions.toggleMusic },
      { type: "separator" },
      { label: "Reset Progress…", click: actions.resetProgress },
    ],
  };
}
