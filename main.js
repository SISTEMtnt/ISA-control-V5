const { app, BrowserWindow, screen, ipcMain } = require("electron");

let win;

function createWindow() {

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,

    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    movable: false,
    skipTaskbar: true,
    fullscreenable: false,
    hasShadow: false,

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile("client/index.html");

  // click-through by default
  win.setIgnoreMouseEvents(true, { forward: true });
}

ipcMain.on("abort", () => {
  app.quit();
});

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());