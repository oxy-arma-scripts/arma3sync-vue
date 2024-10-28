// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';
import renderLogger from './lib/logger';

const logger = renderLogger.scope('counter');

type BridgeCallback<T> = (value: T) => void;

const bridge = {
  getCounter: () => ipcRenderer.invoke('counter') as Promise<number>,
  onCounterUpdate: (cb: BridgeCallback<number>) => ipcRenderer.on('counter', (ev, data) => {
    logger.debug('value received', { value: data });
    cb(data);
  }),
  setCounter: (value: number) => {
    logger.debug('value sent', { value });
    ipcRenderer.invoke('counter', value) as Promise<number>;
  },
};

declare global {
  interface Window {
    'ipc': typeof bridge;
  }
}

contextBridge.exposeInMainWorld('ipc', bridge);
