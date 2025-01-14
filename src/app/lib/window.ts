import { ipcMain, type BrowserWindow } from 'electron';

let mainWindow: BrowserWindow;

export function setMainWindow(window: BrowserWindow) {
  mainWindow = window;
}

export function sendToRender(event: string, ...args: any[]) {
  if (!mainWindow) {
    return;
  }
  mainWindow.webContents.send(event, ...args);
}

export function listenToRender(event: string, callback: (...args: any[]) => void) {
  ipcMain.handle(event, callback)
}

export { type BrowserWindow };
