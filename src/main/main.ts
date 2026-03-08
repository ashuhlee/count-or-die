
import path from 'node:path';
import { setDiscordStatus } from './discordRPC.ts';
import { app, nativeImage, ipcMain, dialog, shell, Menu, BrowserWindow } from 'electron';

import type { IpcMainEvent, MenuItemConstructorOptions } from 'electron';


const isMac = process.platform === 'darwin';
const iconPath =
	isMac ? path.join(__dirname, '../../resources/icons/icon.icns')
	: path.join(__dirname, '../../resources/icons/icon.ico');

if (isMac) {
	const dockIcon = nativeImage.createFromPath(iconPath);
	app.dock?.setIcon(dockIcon);
}


ipcMain.on('discord:update', async (_event: IpcMainEvent, data) => {
	await setDiscordStatus(data);
})

ipcMain.on('close', () => {
	app.quit()
})

ipcMain.handle('gpu:warning', async () => {
	return dialog.showMessageBox({
		icon: iconPath,
		type: 'warning',
		buttons: ['Okay'],
		title: 'Uh Oh!',
		message: 'Hardware Acceleration Required',
		detail: 'Graphic hardware acceleration is disabled. The game requires it for proper performance!',
		noLink: true
	})
})


function createWindow() {

	const mainWindow = new BrowserWindow({
		width: 1920,
		height: 1100,
		minWidth: 450,
		minHeight: 800,
		resizable: true,
		maximizable: true,
		fullscreenable: true,
		backgroundColor: '#FFBDEF',
		icon: iconPath,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: true,
			contextIsolation: true
		}
	});

	if (!app.isPackaged) {
		mainWindow.loadURL('http://localhost:5173').catch(error => console.warn(error));
	} else {
		mainWindow.loadFile(path.join(__dirname, '../renderer/main_window/index.html')).catch(error => {
			console.warn(error);
		});
	}
	// get high score after renderer loads
	mainWindow.webContents.on('did-finish-load', async () => {
		try {
			const highScore = await mainWindow.webContents.executeJavaScript('localStorage.getItem("highScore")');
			const score = Number(highScore) || 0;
			await setDiscordStatus({highScoreRPC: score});
		} catch (error) {
			console.warn(error);
		}
	});
}

app.whenReady().then(() => {
	createWindow();
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow()
		}
	})
})

app.on('window-all-closed', () => {
	if (!isMac) {
		app.quit()
	}
})


const macAppMenu: MenuItemConstructorOptions = {
	label: app.name,
	submenu: [
		{ role: 'about' },
		{ type: 'separator' },
		{ role: 'services' },
		{ type: 'separator' },
		{ role: 'hide' },
		{ role: 'hideOthers' },
		{ role: 'unhide' },
		{ type: 'separator', },
		{ role: 'quit' }
	]
}

const fileMenu: MenuItemConstructorOptions = {
	label: 'File',
	submenu: [{ role: isMac ? 'close' : 'quit'}]
}

const viewMenu: MenuItemConstructorOptions = {
	label: 'View',
	submenu: [
		{ role: 'reload' },
		{ role: 'forceReload' },
		{ role: 'toggleDevTools' },
		{ type: 'separator' },
		{ role: 'resetZoom' },
		{ role: 'zoomIn' },
		{ role: 'zoomOut' },
		{ type: 'separator' },
		{ role: 'togglefullscreen' }
	]
}

const windowMenu: MenuItemConstructorOptions = {
	label: 'Window',
	submenu: [
		{ role: 'minimize' },
		{ role: 'zoom'},
		...(isMac ? [
			{ type: 'separator' as const},
			{ role: 'front' as const},
			{ type: 'separator' as const},
			{ role: 'window' as const}

		] : [{ role: 'close' as const}])
	]
}

const helpMenu: MenuItemConstructorOptions = {
	role: 'help',
	submenu: [{
			label: 'Learn More',
			click: async () => { await shell.openExternal('https://countordie.gg')}
		}]
}

const template: MenuItemConstructorOptions[] = [
	...(isMac ? [macAppMenu] : []),
	fileMenu,
	viewMenu,
	windowMenu,
	helpMenu
]

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
