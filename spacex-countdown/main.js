const { app, BrowserWindow, screen, ipcMain } = require("electron");
const path = require("path");

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
    focusable: true, // allows IPC + interaction if needed

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load renderer
  win.loadFile(path.join(__dirname, "client/index.html"));

  // Optional: start click-through mode
  win.setIgnoreMouseEvents(true, { forward: true });

  // Remove menu for clean overlay
  win.setMenu(null);
}

/* ================= IPC ================= */

ipcMain.on("abort", () => {
  if (win) win.webContents.send("abort"); // notify renderer first
  app.quit();
});

/* ================= APP LIFECYCLE ================= */

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  app.quit();
});
