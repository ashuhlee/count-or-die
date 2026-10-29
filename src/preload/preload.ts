import { contextBridge, ipcRenderer } from "electron";
import type { MessageBoxReturnValue } from "electron";
import type { Presence } from "../main/discord.ts";

export interface ElectronAPI {
  setDiscordStatus: (data: Presence) => Promise<void>;
  quitApp: () => void;
  showGpuWarning: () => Promise<MessageBoxReturnValue>;
}

contextBridge.exposeInMainWorld("electron", {
  setDiscordStatus: async (data: Presence) =>
    ipcRenderer.send("discord:update", data),
  quitApp: () => ipcRenderer.send("close"),
  showGpuWarning: () => ipcRenderer.invoke("gpu:warning"),
} satisfies ElectronAPI);
