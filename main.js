const { app, BrowserWindow } = require("electron");
const { ipcMain } = require("electron")

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

    win.loadFile("game.html");
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

// auto reload electron app
try {
    require("electron-reload")(__dirname);
}   catch (err) {
}

// auto listen for close-app event
// ipcMain.on('close-app', () => {
//     app.quit();
// })