
import { setDiscordStatus } from './discordRPC.js';
const { app, BrowserWindow, nativeImage } = require('electron');
const { shell } = require('electron/common');
const { Menu } = require('electron/main');
const { ipcMain } = require('electron');

const path = require('path');
const isMac = process.platform === 'darwin'

const template = [
  // { role: 'appMenu' }
  ...(isMac
    ? [{
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      }]
    : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  // { role: 'viewMenu' }
  {
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
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac
        ? [
            { type: 'separator' },
            { role: 'front' },
            { type: 'separator' },
            { role: 'window' }
          ]
        : [
            { role: 'close' }
          ])
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron');
          await shell.openExternal('https://countordie.gg');
        },
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

ipcMain.on('discord:update', (event, data) => {
	setDiscordStatus(data);
})

function createWindow() {

    const iconPath = path.join(__dirname, '../../src/renderer/assets/icons/mac/icon.icns');

    const mainWindow = new BrowserWindow({
        width: 475,
        height: 900,
        resizable: true,
        maximizable: true,
        fullscreenable: true,
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
		mainWindow.webContents.executeJavaScript('localStorage.getItem("high-score")')
			.then(highScore => {
				const score = Number(highScore) || 0;
				setDiscordStatus({ highScoreRPC: score });
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
