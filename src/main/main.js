const { app, BrowserWindow } = require("electron");
const { ipcMain } = require("electron")

const path = require("path");

try {
  require("electron-reload")(
    path.join(__dirname, "..", "renderer"),
    {
      electron: path.join(__dirname, "..", "..", "node_modules", ".bin", "electron"),
      hardResetMethod: "exit"
    }
  );
  console.log("Electron reload active");
} catch (err) {
  console.error("Electron reload failed:", err);
}


function createWindow() {

    const win = new BrowserWindow({
        width: 500,
        height: 840,
        resizable: true,
        maximizable: true,
        fullscreenable: true,
        webPreferences: {
            // preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadFile("src/renderer/game.html");
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});