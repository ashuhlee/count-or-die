
import { setDiscordStatus } from './discordRPC.js';
import { app, nativeImage, ipcMain, dialog, Menu, BrowserWindow } from 'electron';
import path from 'node:path';


const isMac = process.platform === 'darwin';
const iconPath =
	isMac ? path.join(__dirname, '../../resources/icons/icon.icns')
	: path.join(__dirname, '../../resources/icons/icon.ico');

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

ipcMain.on('discord:update', (event, data) => {
	setDiscordStatus(data);
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

	if (isMac) {
		const dockIcon = nativeImage.createFromPath(iconPath);
		app.dock.setIcon(dockIcon);
	}

	if (!app.isPackaged) {
		mainWindow.loadURL('http://localhost:5173');
	} else {
		mainWindow.loadFile(path.join(__dirname, '../renderer/main_window/index.html'));
	}

	// get high score after renderer loads
	mainWindow.webContents.on('did-finish-load', () => {

		// TODO: change this when switching from local storage
		mainWindow.webContents.executeJavaScript('localStorage.getItem("highScore")')
			.then(highScore => {
				const score = Number(highScore) || 0;
				setDiscordStatus({highScoreRPC: score});
			})
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

ipcMain.on('close', () => {
	app.quit()
})

const template = [
	// { role: 'appMenu' }
	...(isMac
		? [{
			label: app.name,
			submenu: [
				{role: 'about'},
				{type: 'separator'},
				{role: 'services'},
				{type: 'separator'},
				{role: 'hide'},
				{role: 'hideOthers'},
				{role: 'unhide'},
				{type: 'separator'},
				{role: 'quit'}
			]
		}]
		: []),
	// { role: 'fileMenu' }
	{
		label: 'File',
		submenu: [
			isMac ? {role: 'close'} : {role: 'quit'}
		]
	},
	// { role: 'viewMenu' }
	{
		label: 'View',
		submenu: [
			{role: 'reload'},
			{role: 'forceReload'},
			{role: 'toggleDevTools'},
			{type: 'separator'},
			{role: 'resetZoom'},
			{role: 'zoomIn'},
			{role: 'zoomOut'},
			{type: 'separator'},
			{role: 'togglefullscreen'}
		]
	},
	// { role: 'windowMenu' }
	{
		label: 'Window',
		submenu: [
			{role: 'minimize'},
			{role: 'zoom'},
			...(isMac
				? [
					{type: 'separator'},
					{role: 'front'},
					{type: 'separator'},
					{role: 'window'}
				]
				: [
					{role: 'close'}
				])
		]
	},
	{
		role: 'help',
		submenu: [
			{
				label: 'Learn More',
				click: async () => {
					const {shell} = require('electron');
					await shell.openExternal('https://countordie.gg');
				},
			}
		]
	}
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)