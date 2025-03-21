import { app, shell, BrowserWindow, ipcMain, utilityProcess } from "electron";
import path, { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";

// Переменная базы данных
let db;

function createWindow() {
  // Создание окна
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    minWidth: 860,
    minHeight: 610,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }

  // Подпроцесс подключения к базе данных
  db = utilityProcess.fork(path.join(__dirname, "../../src/utility/db.js"));
  db.postMessage({ type: "start-connection" });
  db.on("message", (message) => {
    switch (message.type) {
      case "db-error":
        console.log(`\x1b[31mError from db: ${message.error}\x1b[0m`);
        break;
      case "db-connection-success":
        console.log(`\x1b[32m${message.info}\x1b[0m`);
        break;
    }
  });
  db.on("exit", (code) => {
    console.log(`Child process exited with code ${code}`);
  });
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC-обработчики
  ipcMain.handle("clear-data", async () => {
    return new Promise((resolve, reject) => {
      db.postMessage({ type: "clear-data" });

      const messageHandler = (message) => {
        if (message.type === "db-clear-success") {
          console.log(`\x1b[32m${message.info}...\x1b[0m`);
          db.removeListener("message", messageHandler);
          resolve(message.info);
        } else if (message.type === "db-error") {
          console.log(`\x1b[31mError from db: ${message.error}\x1b[0m`);
          db.removeListener("message", messageHandler);
          reject(message.error);
        }
      };

      db.on("message", messageHandler);
    });
  });
  ipcMain.handle("generate-data", async (event, number) => {
    return new Promise((resolve, reject) => {
      db.postMessage({ type: "generate-data", number });

      const messageHandler = (message) => {
        if (message.type === "db-generate-success") {
          console.log(`\x1b[32m${message.info}...\x1b[0m`);
          db.removeListener("message", messageHandler);
          resolve(message.info);
        } else if (message.type === "db-error") {
          console.log(`\x1b[31mError from db: ${message.error}\x1b[0m`);
          db.removeListener("message", messageHandler);
          reject(message.error);
        }
      };

      db.on("message", messageHandler);
    });
  });
  ipcMain.handle("get-data", async () => {
    return new Promise((resolve, reject) => {
      db.postMessage({ type: "get-data" });

      const messageHandler = (message) => {
        if (message.type === "db-get-data") {
          console.log(
            `\x1b[32mReceived data from DB: ${JSON.stringify(message.data[0])}...\x1b[0m`
          );
          db.removeListener("message", messageHandler);
          resolve(message.data);
        } else if (message.type === "db-error") {
          db.removeListener("message", messageHandler);
          console.log(`\x1b[31mError from db: ${message.error}\x1b[0m`);
          reject();
        }
      };

      db.on("message", messageHandler);
    });
  });

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
