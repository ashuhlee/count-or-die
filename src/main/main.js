const { app, BrowserWindow, nativeImage } = require("electron");
const { ipcMain } = require("electron");
const path = require("path");

function createWindow() {

    const iconPath = path.resolve(__dirname, '../assets/icons/mac/icon.icns');

    const mainWindow = new BrowserWindow({
        width: 500,
        height: 900,
        resizable: true,
        maximizable: true,
        fullscreenable: true,
        icon: iconPath,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
			contextIsolation: false
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


// reload app after changes
if (!app.isPackaged) {
	require("electron-reload")(
    path.join(__dirname, "..", "renderer"),
    {electron: path.join(__dirname, "..", "..", "node_modules", ".bin", "electron"),}
  );
}