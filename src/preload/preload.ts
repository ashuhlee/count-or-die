import { contextBridge, ipcRenderer } from "electron";
import type { IpcRendererEvent, MessageBoxReturnValue } from "electron";
import type { Presence } from "../main/discordRPC.ts";
import type { MenuAction } from "../renderer/utils/app/menuActions.ts";

export interface ElectronAPI {
  setDiscordStatus: (data: Presence) => Promise<void>;
  quitApp: () => void;
  reportBug: () => void;
  openGithub: () => void;
  openChangelog: () => void;
  showGpuWarning: () => Promise<MessageBoxReturnValue>;
  onMenuAction: (callback: (action: MenuAction) => void) => () => void;
}

contextBridge.exposeInMainWorld("electron", {
  setDiscordStatus: async (data: Presence) =>
    ipcRenderer.send("discord:update", data),
  quitApp: () => ipcRenderer.send("close"),

  reportBug: () => ipcRenderer.send("bug-report"),
  openGithub: () => ipcRenderer.send("open-github"),
  openChangelog: () => ipcRenderer.send("open-changelog"),

  showGpuWarning: () => ipcRenderer.invoke("gpu:warning"),

  onMenuAction: (callback: (action: MenuAction) => void) => {
    const listener = (_event: IpcRendererEvent, action: MenuAction) =>
      callback(action);
    ipcRenderer.on("menu:action", listener);
    return () => ipcRenderer.removeListener("menu:action", listener);
  },
} satisfies ElectronAPI);
