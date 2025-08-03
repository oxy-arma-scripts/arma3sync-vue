// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge } from 'electron';

import { registerBridge, registerReadonlyBridge, registerIPCMethod } from '~/lib/bridge';

import type { Settings } from '~/app/models/settings/types';
import type { LoadingState } from '~/app/models/loadingState/types';
import type { GameState } from '~/app/models/game/types';
import type { ModsState, ModSource } from '~/app/models/mods/types';
import type { SyncState, SyncSource } from './app/models/sync/types';

const ipc = {
  bridges: {
    loadingState: registerReadonlyBridge<LoadingState>('loading-state'),
    settings: registerBridge<Settings>('settings'),
    game: registerReadonlyBridge<GameState>('game'),
    mods: registerBridge<ModsState>('mods'),
    sync: registerBridge<SyncState>('sync'),
  },
  methods: {
    // Game methods
    startGame: registerIPCMethod('startGame'),
    openGameFolderPicker: registerIPCMethod('openGameFolderPicker'),
    openGameFolder: registerIPCMethod<string>('openGameFolder'),
    // Mod sources methods
    openModSourceFolder: registerIPCMethod<string, [ModSource]>('openModSourceFolder'),
    addModSource: registerIPCMethod<ModSource[]>('addModSource'),
    removeModSource: registerIPCMethod<void, [ModSource]>('removeModSource'),
    // Sync methods
    importSyncSource: registerIPCMethod<SyncSource, [string]>('importSyncSource'),
  },
};

declare global {
  interface Window {
    'ipc': typeof ipc;
  }
}

contextBridge.exposeInMainWorld('ipc', ipc);
