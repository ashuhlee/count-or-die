
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld('electron', {
  setDiscordStatus: (data) => ipcRenderer.send('discord:update', data)
});