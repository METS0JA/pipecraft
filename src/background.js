"use strict";

import { app, protocol, BrowserWindow, ipcMain } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import * as remoteMain from "@electron/remote/main";
remoteMain.initialize();
import * as pty from "node-pty";
import os from "os";
import { prototype } from "events";

var shell = os.platform() === "win32" ? "powershell.exe" : "bash";
// import { exitCode, stdout } from "process";

const isDevelopment = process.env.NODE_ENV !== "production";

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      // nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });
  remoteMain.enable(win.webContents);
  //win.removeMenu();

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }
  var ptyProcess = pty.spawn(shell, [], {
    name: "xterm-color",
    cwd: process.env.HOME,
    env: process.env,
  });
  ptyProcess.on("data", function(data) {
    win.webContents.send("terminal.incData", data);
  });
  // ptyProcess.write('clear\r')
  // ptyProcess.write('echo "Setting up the terminal"\r');
  // ptyProcess.write('clear\r');

  ipcMain.on("terminal.toTerm", function(event, data) {
    ptyProcess.write(data);
  });
  ipcMain.on("openExpert", function(event, data) {
    ptyProcess.write("gc expertReadme.txt\r");
  });
  ipcMain.on("terminalResize", function(event, data) {
    console.log(data);
    ptyProcess.resize(
      Math.max(data ? data.cols : data.cols, 1),
      Math.max(data ? data.rows : data.rows, 1),
    );
  });
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
