import { contextBridge, ipcRenderer } from "electron";
import type { MessageBoxReturnValue } from "electron";
import type { Presence } from "../main/discordRPC.ts";

export interface ElectronAPI {
  setDiscordStatus: (data: Presence) => Promise<void>;
  quitApp: () => void;
  reportBug: () => void;
  openGithub: () => void;
  showGpuWarning: () => Promise<MessageBoxReturnValue>;
}

contextBridge.exposeInMainWorld("electron", {
  setDiscordStatus: async (data: Presence) =>
    ipcRenderer.send("discord:update", data),
  quitApp: () => ipcRenderer.send("close"),
  reportBug: () => ipcRenderer.send("bug-report"),
  openGithub: () => ipcRenderer.send("open-github"),
  showGpuWarning: () => ipcRenderer.invoke("gpu:warning"),
} satisfies ElectronAPI);
