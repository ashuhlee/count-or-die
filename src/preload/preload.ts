
import { contextBridge, ipcRenderer } from 'electron';
import type { MessageBoxReturnValue } from 'electron';

export type DiscordStatus = {
	highScoreRPC? : number;
	gameStatusRPC?: 'in-game' | 'game-over'
}

export interface ElectronAPI {
	setDiscordStatus: (data: DiscordStatus) => void;
	quitApp: () => void;
	showGpuWarning: () => Promise<MessageBoxReturnValue>
}

contextBridge.exposeInMainWorld('electron', {
	setDiscordStatus: (data) => ipcRenderer.send('discord:update', data),
	quitApp: () => ipcRenderer.send('close'),
	showGpuWarning: () => ipcRenderer.invoke('gpu:warning')
} satisfies ElectronAPI);