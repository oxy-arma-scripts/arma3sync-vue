import { setMainWindow, type BrowserWindow } from './lib/window';
import './models/counter';

export function init(browser: BrowserWindow) {
  setMainWindow(browser);
}
