// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge } from 'electron';

import { registerBridge, registerReadonlyBridge, registerIPCMethod } from '~/lib/bridge';

import type { Settings } from '~/app/models/settings/types';
import type { LoadingState } from '~/app/models/loadingState/types';
import type { GameState } from '~/app/models/game/types';
import type { ModsState, ModSource } from '~/app/models/mods/types';
import type { RepositoriesState, Repository } from './app/models/repositories/types';

const ipc = {
  bridges: {
    loadingState: registerReadonlyBridge<LoadingState>('loading-state'),
    settings: registerBridge<Settings>('settings'),
    game: registerReadonlyBridge<GameState>('game'),
    mods: registerBridge<ModsState>('mods'),
    repositories: registerBridge<RepositoriesState>('repositories'),
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
    // Repositories methods
    importRepository: registerIPCMethod<Repository, [string]>('importRepository'),
  },
};

declare global {
  interface Window {
    'ipc': typeof ipc;
  }
}

contextBridge.exposeInMainWorld('ipc', ipc);
