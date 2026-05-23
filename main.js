const { app, BrowserWindow, screen, ipcMain } = require("electron");

let win;
let overlayEnabled = true;

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

  // start in click-through mode
  win.setIgnoreMouseEvents(true, { forward: true });

  win.setMenu(null);
}

/* =========================
   TOGGLE OVERLAY MODE
========================= */

ipcMain.on("toggle-overlay", () => {
  overlayEnabled = !overlayEnabled;

  if (overlayEnabled) {
    // interactive mode
    win.setIgnoreMouseEvents(false);
    win.webContents.send("overlay-state", true);
  } else {
    // click-through mode
    win.setIgnoreMouseEvents(true, { forward: true });
    win.webContents.send("overlay-state", false);
  }
});

/* =========================
   ABORT APP
========================= */

ipcMain.on("abort", () => {
  if (win) win.webContents.send("abort");
  app.quit();
});

/* =========================
   APP LIFECYCLE
========================= */

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  app.quit();
});
