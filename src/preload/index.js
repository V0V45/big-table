import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

// Отдельное api для связки renderer и main
const api = {
  generateData: (number) => ipcRenderer.invoke("generate-data", number),
  clearData: () => ipcRenderer.invoke("clear-data"),
  getData: () => ipcRenderer.invoke("get-data")
};

// Проверка для contextIsolated
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.api = api;
}
