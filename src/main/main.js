
const { app, BrowserWindow, nativeImage } = require("electron");

const { ipcMain } = require("electron");
import { setDiscordStatus } from "./discordRPC.js";

const path = require("path");

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

    if (process.platform === "darwin") {
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

	app.on("activate", () => {
    	if (BrowserWindow.getAllWindows().length === 0) {
    		createWindow()
    	}
  	})
})

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit()
  	}
})

ipcMain.on("close", () => {
  app.quit()
})
