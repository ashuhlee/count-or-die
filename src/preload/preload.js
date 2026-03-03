
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
	setDiscordStatus: (data) => ipcRenderer.send('discord:update', data),
	quitApp: () => ipcRenderer.send('close'),
	showGpuWarning: () => ipcRenderer.invoke('gpu:warning')
});