// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge } from 'electron';

import {
  registerBridge,
  registerReadonlyBridge,
  registerIPCMethod,
} from '~/lib/bridge';

import type { ComputedSettings } from '~/app/models/settings/types';
import type { LoadingState } from '~/app/models/loadingState/types';
import type { GameState, StartGameOptions } from '~/app/models/game/types';
import type { ComputedModsState, ModSource } from '~/app/models/mods/types';
import type { ModsetsState, Modset } from '~/app/models/modsets/types';
import type {
  GameServersState,
  GameServer,
} from '~/app/models/gameServers/types';
import type {
  ComputedRepositoriesState,
  Repository,
  RepositorySyncItem,
} from '~/app/models/repositories/types';

const ipc = {
  bridges: {
    loadingState: registerReadonlyBridge<LoadingState>('loading-state'),
    settings: registerBridge<ComputedSettings>('settings'),
    game: registerReadonlyBridge<GameState>('game'),
    mods: registerBridge<ComputedModsState>('mods'),
    repositories: registerBridge<ComputedRepositoriesState>('repositories'),
    modsets: registerBridge<ModsetsState>('modsets'),
    gameServers: registerBridge<GameServersState>('game-servers'),
  },
  methods: {
    game: {
      start: registerIPCMethod<void, [StartGameOptions | undefined]>(
        'startGame'
      ),
      openFolderPicker: registerIPCMethod('openGameFolderPicker'),
      openFolder: registerIPCMethod<string>('openGameFolder'),
    },
    mods: {
      addSources: registerIPCMethod<void, [ModSource[]]>('addModSources'),
      editSource: registerIPCMethod<void, [ModSource]>('editModSource'),
      removeSource: registerIPCMethod<void, [ModSource]>('removeModSource'),

      openSourcePicker: registerIPCMethod<ModSource[]>('openModSourcePicker'),
      openSourceFolder: registerIPCMethod<string, [ModSource]>(
        'openModSourceFolder'
      ),
    },
    repositories: {
      add: registerIPCMethod<void, [Repository]>('addRepository'),
      edit: registerIPCMethod<void, [Repository]>('editRepository'),
      remove: registerIPCMethod<void, [Repository]>('removeRepository'),

      openFolder: registerIPCMethod<string, [Repository]>(
        'openRepositoryFolder'
      ),

      import: registerIPCMethod<Omit<Repository, 'destination'>, [string]>(
        'importRepository'
      ),
      checkInfo: registerIPCMethod<boolean, [Repository]>(
        'checkRepositoryInfo'
      ),
      fetchDiff: registerIPCMethod<RepositorySyncItem[], [Repository]>(
        'fetchRepositoryDiff'
      ),
      syncDiff: registerIPCMethod<
        unknown[],
        [Repository, RepositorySyncItem[]]
      >('syncRepositoryDiff'),

      fetchModsets: registerIPCMethod<Modset[], [Repository]>(
        'fetchRepositoryModsets'
      ),
      fetchGameServers: registerIPCMethod<GameServer[], [Repository]>(
        'fetchRepositoryGameServers'
      ),
    },
    modsets: {
      add: registerIPCMethod<void, [Modset]>('addModset'),
      edit: registerIPCMethod<void, [Modset]>('editModset'),
      remove: registerIPCMethod<void, [Modset]>('removeModset'),

      apply: registerIPCMethod<void, [Modset]>('applyModset'),
      unapply: registerIPCMethod<void, [Modset]>('unapplyModset'),
    },
    gameServers: {
      add: registerIPCMethod<void, [GameServer]>('addGameServer'),
      edit: registerIPCMethod<void, [GameServer]>('editGameServer'),
      remove: registerIPCMethod<void, [GameServer]>('removeGameServer'),
    },
  },
};

declare global {
  // oxlint-disable-next-line consistent-type-definitions
  interface Window {
    ipc: typeof ipc;
  }
}

contextBridge.exposeInMainWorld('ipc', ipc);
