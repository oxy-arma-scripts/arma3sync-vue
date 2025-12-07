import {
  dialog,
  ipcMain,
  type OpenDialogOptions,
  type BrowserWindow,
  type OpenDialogReturnValue,
} from 'electron';

let mainWindow: BrowserWindow;

export function setMainWindow(window: BrowserWindow): void {
  mainWindow = window;
}

export function sendToRender(event: string, ...args: unknown[]): void {
  if (!mainWindow) {
    return;
  }
  mainWindow.webContents.send(event, ...args);
}

export function listenToRender(
  event: string,
  listener: (...args: unknown[]) => void
): void {
  ipcMain.handle(event, listener);
}

export const showOpenDialog = (
  opts: OpenDialogOptions
): Promise<OpenDialogReturnValue> => dialog.showOpenDialog(mainWindow, opts);

export { type BrowserWindow };
