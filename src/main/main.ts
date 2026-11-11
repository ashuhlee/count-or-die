import path from "node:path";
import started from "electron-squirrel-startup";
import { updateElectronApp } from "update-electron-app";
import { setDiscordStatus } from "./discordRPC.ts";
import {
  app,
  nativeImage,
  ipcMain,
  dialog,
  shell,
  Menu,
  BrowserWindow,
} from "electron";

import type { IpcMainEvent, MenuItemConstructorOptions } from "electron";

import type { MenuAction } from "../renderer/utils/app/menuActions.ts";

import { setUpAboutPanel, showAbout } from "./about.ts";
import { checkForUpdates } from "./checkForUpdates.ts";
import { lockDown } from "./lockDown.ts";
import { createGameMenu, createViewMenu } from "./menu.ts";
import { canAutoUpdate } from "./updates.ts";

if (started) app.quit();

const isMac = process.platform === "darwin";
const iconPath = isMac
  ? path.join(__dirname, "../../resources/icons/icon.icns")
  : path.join(__dirname, "../../resources/icons/icon.ico");

if (isMac) {
  const dockIcon = nativeImage.createFromPath(iconPath);
  app.dock?.setIcon(dockIcon);
}

ipcMain.on("discord:update", async (_event: IpcMainEvent, data) => {
  await setDiscordStatus(data);
});

ipcMain.on("close", () => {
  app.quit();
});

const BUG_REPORT_URL =
  "https://github.com/ashuhlee/count-or-die/issues/new?template=bug_report.yml";
const FEEDBACK_URL = "https://forms.gle/zqN2TVqHpaTRiNJSA";

ipcMain.on("bug-report", () => {
  void shell.openExternal(BUG_REPORT_URL);
});

const GITHUB_URL = "https://github.com/ashuhlee/count-or-die";

ipcMain.on("open-github", () => {
  void shell.openExternal(GITHUB_URL);
});

const CHANGELOG_URL = "https://github.com/ashuhlee/count-or-die/releases";

ipcMain.on("open-changelog", () => {
  void shell.openExternal(CHANGELOG_URL);
});

ipcMain.handle("gpu:warning", async () => {
  return dialog.showMessageBox({
    icon: iconPath,
    type: "warning",
    buttons: ["Okay"],
    title: "Uh Oh!",
    message: "Hardware Acceleration Required",
    detail:
      "Graphic hardware acceleration is disabled. The game requires it for proper performance!",
    noLink: true,
  });
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1100,
    minWidth: 450,
    minHeight: 800,
    resizable: true,
    maximizable: true,
    fullscreenable: true,
    backgroundColor: "#FFBDEF",
    show: false,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: !app.isPackaged,
    },
  });

  lockDown(mainWindow.webContents, app.isPackaged);

  mainWindow.once("ready-to-show", () => mainWindow.show());

  if (!app.isPackaged) {
    mainWindow
      .loadURL("http://localhost:5173")
      .catch((error) => console.warn(error));
  } else {
    mainWindow
      .loadFile(path.join(__dirname, "../renderer/main_window/index.html"))
      .catch((error) => {
        console.warn(error);
      });
  }
  // get high score after renderer loads
  mainWindow.webContents.on("did-finish-load", async () => {
    try {
      const highScore = await mainWindow.webContents.executeJavaScript(
        'localStorage.getItem("highScore")',
      );
      const score = Number(highScore) || 0;
      await setDiscordStatus({ highScoreRPC: score });
    } catch (error) {
      console.warn(error);
    }
  });
}

app.whenReady().then(() => {
  if (started) return;

  createWindow();
  if (canAutoUpdate(process.platform, app.isPackaged)) {
    try {
      updateElectronApp();
    } catch (error) {
      console.warn(error);
    }
  }
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});

function sendMenuAction(action: MenuAction): void {
  const window =
    BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
  window?.webContents.send("menu:action", action);
}

async function confirmResetProgress(): Promise<void> {
  const options = {
    icon: iconPath,
    type: "warning" as const,
    buttons: ["Reset Progress", "Cancel"],
    defaultId: 1,
    cancelId: 1,
    title: "Reset Progress",
    message: "Reset all your progress?",
    detail:
      "This erases your high score, death count and daily challenges, and restarts the game. It can't be undone.",
    noLink: true,
  };
  const window = BrowserWindow.getFocusedWindow();
  const { response } = window
    ? await dialog.showMessageBox(window, options)
    : await dialog.showMessageBox(options);
  if (response === 0) sendMenuAction("reset-progress");
}

const checkForUpdatesItem: MenuItemConstructorOptions = {
  label: "Check for Updates…",
  enabled: canAutoUpdate(process.platform, app.isPackaged),
  click: checkForUpdates,
};

if (isMac) setUpAboutPanel();

const macAppMenu: MenuItemConstructorOptions = {
  label: app.name,
  submenu: [
    { role: "about" },
    checkForUpdatesItem,
    { type: "separator" },
    { role: "services" },
    { type: "separator" },
    { role: "hide" },
    { role: "hideOthers" },
    { role: "unhide" },
    { type: "separator" },
    { role: "quit" },
  ],
};

const fileMenu: MenuItemConstructorOptions = {
  label: "File",
  submenu: [
    ...(isMac ? [] : [checkForUpdatesItem, { type: "separator" as const }]),
    { role: isMac ? "close" : "quit" },
  ],
};

function menuSymbol(name: string) {
  const symbol = nativeImage.createFromNamedImage(name).resize({ height: 32 });
  const icon = nativeImage.createFromBuffer(symbol.toPNG(), {
    scaleFactor: 2,
  });
  icon.setTemplateImage(true);
  return icon;
}

const gameMenuIcons = isMac
  ? {
      challenges: menuSymbol("trophy"),
      howToPlay: menuSymbol("questionmark"),
    }
  : undefined;

const gameMenu = createGameMenu(
  {
    openChallenges: () => sendMenuAction("open-challenges"),
    openHowToPlay: () => sendMenuAction("open-help"),
    muteSound: () => sendMenuAction("mute-sound"),
    toggleMusic: () => sendMenuAction("toggle-music"),
    resetProgress: () => void confirmResetProgress(),
  },
  gameMenuIcons,
);

const viewMenu = createViewMenu(app.isPackaged);

const windowMenu: MenuItemConstructorOptions = {
  label: "Window",
  submenu: [
    { role: "minimize" },
    { role: "zoom" },
    ...(isMac
      ? [
          { type: "separator" as const },
          { role: "front" as const },
          { type: "separator" as const },
          { role: "window" as const },
        ]
      : [{ role: "close" as const }]),
  ],
};

const helpMenu: MenuItemConstructorOptions = {
  role: "help",
  submenu: [
    {
      label: "View Changelog",
      icon: isMac ? menuSymbol("document") : undefined,
      click: async () => {
        await shell.openExternal(CHANGELOG_URL);
      },
    },
    { type: "separator" },
    {
      label: "Learn More",
      click: async () => {
        await shell.openExternal("https://countordie.gg");
      },
    },
    { type: "separator" },
    {
      label: "Report a Bug",
      click: async () => {
        await shell.openExternal(BUG_REPORT_URL);
      },
    },
    {
      label: "Leave Feedback",
      click: async () => {
        await shell.openExternal(FEEDBACK_URL);
      },
    },
    ...(isMac
      ? []
      : [
          { type: "separator" as const },
          {
            label: "About Count or Die",
            click: () => showAbout(iconPath),
          },
        ]),
  ],
};

const template: MenuItemConstructorOptions[] = [
  ...(isMac ? [macAppMenu] : []),
  fileMenu,
  gameMenu,
  viewMenu,
  windowMenu,
  helpMenu,
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
