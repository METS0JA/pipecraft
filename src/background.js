"use strict";

import { app, protocol, BrowserWindow, ipcMain } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
// import { exitCode, stdout } from "process";
var Docker = require("dockerode");
var docker = new Docker({ socketPath: "//./pipe/docker_engine" });
const streams = require("memory-streams");
var stdout = new streams.WritableStream();
var stderr = new streams.WritableStream();

const isDevelopment = process.env.NODE_ENV !== "production";

async function imageCheck(imageName) {
  console.log(imageName);
  let repoList = [];
  let imageList = await docker.listImages();
  imageList.forEach((image) => {
    repoList.push(image.RepoTags[0]);
  });
  console.log(repoList);
  if (repoList.includes(imageName) === false) {
    console.log(`pulling image ${imageName}`);
    await docker.pull(imageName);
  }
}

ipcMain.on(
  "runStep",
  async (event, imageName, scriptName, envVariables, Input) => {
    var result = await docker
      .run(
        imageName,
        ["sh", "-c", `/scripts/${scriptName}`],
        [stdout, stderr],
        {
          Tty: false,
          WorkingDir: "/input",
          Volumes: {},
          HostConfig: {
            Binds: [
              `${process.cwd()}/src/pipecraft-core/service_scripts:/scripts`, // Edit path for build
              `${Input}:/input`,
            ],
          },
          Env: envVariables,
        }
      )
      .then(([res, container]) => {
        let resObj = { statusCode: res.StatusCode };
        console.log(res);
        console.log("stdout:", stdout.toString());
        console.log("stderr:", stderr.toString());
        if (res.StatusCode === 0) {
          resObj.log = stdout.toString();
          return resObj;
        } else {
          resObj.log = stderr.toString();
          return resObj;
        }
      })
      .then(async (container) => {
        let variables = await docker.container.exec({ Cmd: ["env"] });
        console.log(variables);
        console.log("plz");
      })
      .catch((err) => {
        console.log(err);
        console.log(err);
        console.log(err);
        let resObj = { statusCode: err.code, log: err };
        return resObj;
      });
    console.log(process.cwd());
    console.log(result);
    event.returnValue = result;
    stdout = new streams.WritableStream();
    stderr = new streams.WritableStream();
  }
);

ipcMain.on("checkDockerStatus", async (event) => {
  var result = await docker.ping();
  console.log(result);
  event.returnValue = result;
});
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
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
    },
  });
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
