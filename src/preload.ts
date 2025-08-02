// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge } from 'electron';

import { registerBridge, registerReadonlyBridge, registerIPCMethod } from '~/lib/bridge';

import type { Settings } from '~/app/models/settings/types';
import type { LoadingState } from '~/app/models/loadingState/types';
import type { GameState } from '~/app/models/game/types';
import type { LoadedModSource } from '~/app/models/mods/types';

const ipc = {
  bridges: {
    settings: registerBridge<Settings>('settings'),
const bridge = {
  getCounter: () => ipcRenderer.invoke('counter') as Promise<number>,
  onCounterUpdate: (cb: BridgeCallback<number>) => ipcRenderer.on('counter', (ev, data) => {
    logger.debug('value received', { value: data });
    cb(data);
  }),
  setCounter: (value: number) => {
    logger.debug('value sent', { value });
    ipcRenderer.invoke('counter', value) as Promise<number>;
    loadingState: registerReadonlyBridge<LoadingState>('loading-state'),
    game: registerReadonlyBridge<GameState>('game'),
  },
  methods: {
    startGame: registerIPCMethod('startGame'),
    openGameFolderDialog: registerIPCMethod('openGameFolderDialog'),
    openGameFolder: registerIPCMethod<string>('openGameFolder'),
  },
};

declare global {
  interface Window {
    'ipc': typeof ipc;
  }
}

contextBridge.exposeInMainWorld('ipc', ipc);
