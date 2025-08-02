// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge } from 'electron';

import { registerBridge, registerReadonlyBridge, registerIPCMethod } from '~/lib/bridge';

import type { Settings } from '~/app/models/settings/types';
import type { LoadingState } from '~/app/models/loadingState/types';
import type { GameState } from '~/app/models/game/types';
import type { ModsState } from '~/app/models/mods/types';

const ipc = {
  bridges: {
    settings: registerBridge<Settings>('settings'),
    mods: registerBridge<ModsState>('mods'),
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
