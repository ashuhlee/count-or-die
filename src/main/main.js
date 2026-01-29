const { app, BrowserWindow, nativeImage } = require("electron");
const { ipcMain } = require("electron")
const path = require("path");

function createWindow() {

    const iconPath = path.resolve(__dirname, '../assets/icons/mac/icon.icns');

    const mainWindow = new BrowserWindow({
        width: 500,
        height: 860,
        resizable: true,
        maximizable: true,
        fullscreenable: true,
        icon: iconPath,
        webPreferences: {
            preload: path.join(__dirname, '../preload/preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    if (process.platform === "darwin") {
        const dockIcon = nativeImage.createFromPath(iconPath);
        app.dock.setIcon(dockIcon);
    }

    mainWindow.loadFile("src/renderer/game.html")
}

app.whenReady().then(() => {
    createWindow()

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
})

try {

  require("electron-reload")(
    path.join(__dirname, "..", "renderer"),
    {
      electron: path.join(__dirname, "..", "..", "node_modules", ".bin", "electron"),
      // hardResetMethod: "exit"
    }
  );
  console.log("Electron reload active");
} catch (err) {
  console.log("Electron reload failed:", err);
}