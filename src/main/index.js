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
    show: false, // изначально скрываем окно
    autoHideMenuBar: true, // скрыть строку меню
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false // для получения доступа к Node.js API
    }
  });

  // Открытие окна
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  // Все веб-ссылки открываются во внешнем браузере
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // Включает возможность Hot Reload в режиме run dev и отключает ее в production-коде
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
  // Устанавливает App User Model ID на ОС Windows
  electronApp.setAppUserModelId("com.electron");

  // Дает возможность открыть DevTools в режиме run dev, и отключает эту возможность в production-коде
  // Также игнорирует Command+R (или Ctrl+R) в production-коде
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC-обработчики
  // Очищает данные с базы данных
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
  // Генерирует данные в базу данных
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
  // Получает все данные из базы данных
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
    // На macOS если приложение еще работает, но все окна уже были закрыты,
    // то создается новое окно
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Если все окна закрываются, то приложение завершает свою работу
// Но на macOS приложение остается работать в фоне, пока не будет закрыто через Command+Q
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
