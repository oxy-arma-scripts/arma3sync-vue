import type { ShallowRef, ComputedRef } from 'vue';

import type {
  ComputedRepositoriesState,
  Repository,
  RepositorySyncItem,
} from '~/app/models/repositories/types';
import type { Modset } from '~/app/models/modsets/types';

import toRawDeep from '~/utils/toRawDeep';

import { renderLogger } from '~/lib/logger';

type RepositoryImportComposable = {
  url: ShallowRef<string, string>;
  loading: ComputedRef<boolean>;
  error: ComputedRef<string>;
  changed: ComputedRef<boolean>;
  importRepo: () => Promise<Repository | null>;
};

type RepositoryCheckComposable = {
  loading: ComputedRef<boolean>;
  error: ComputedRef<string>;
  checkRepo: () => Promise<boolean>;
};

async function createRepository(repository: Repository): Promise<void> {
  await window.ipc.methods.repositories.add(toRawDeep(repository));
}

async function updateRepository(repository: Repository): Promise<void> {
  await window.ipc.methods.repositories.edit(toRawDeep(repository));
}

async function deleteRepository(repository: Repository): Promise<void> {
  await window.ipc.methods.repositories.remove(toRawDeep(repository));
}

async function openRepositoryFolder(source: Repository): Promise<void> {
  const error = await window.ipc.methods.repositories.openFolder(
    toRawDeep(source)
  );
  if (error) {
    renderLogger.error('Failed to open repository folder', { error });
  }
}

function fetchRepositorySync(
  repository: Repository
): Promise<RepositorySyncItem[]> {
  return window.ipc.methods.repositories.fetchDiff(toRawDeep(repository));
}

async function syncRepository(
  repository: Repository,
  diff: RepositorySyncItem[]
): Promise<void> {
  await window.ipc.methods.repositories.syncDiff(
    toRawDeep(repository),
    toRawDeep(diff)
  );
}

function fetchRepositoryModsets(repository: Repository): Promise<Modset[]> {
  return window.ipc.methods.repositories.fetchModsets(toRawDeep(repository));
}

export const useRepositoriesStore = defineStore('repositories', () => {
  const {
    value: repositoriesState,
    isSynced,
    loading,
  } = useIPCBridge<ComputedRepositoriesState>('repositories');

  function useRepositoryImport(): RepositoryImportComposable {
    const ongoing = shallowRef(false);
    const changed = shallowRef(false);
    const error = shallowRef('');
    const url = shallowRef('');

    watch(url, () => {
      error.value = '';

      if (!url.value) {
        changed.value = false;
        return;
      }

      if (changed.value) {
        return;
      }

      changed.value = true;
    });

    return {
      url,
      loading: computed(() => ongoing.value),
      error: computed(() => error.value),
      changed: computed(() => changed.value),
      importRepo: async (): Promise<Repository | null> => {
        ongoing.value = true;
        error.value = '';
        try {
          const repo = await window.ipc.methods.repositories.import(url.value);
          changed.value = false;
          return { ...repo, destination: '' };
        } catch (err) {
          renderLogger.error('Failed to import repository', { err });
          error.value = err.message;
          return null;
        } finally {
          ongoing.value = false;
        }
      },
    };
  }

  function useRepositoryCheck(
    repository: Ref<Repository>
  ): RepositoryCheckComposable {
    const ongoing = shallowRef(false);
    const error = shallowRef('');

    return {
      loading: computed(() => ongoing.value),
      error: computed(() => error.value),
      checkRepo: async (): Promise<boolean> => {
        ongoing.value = true;
        error.value = '';
        try {
          await window.ipc.methods.repositories.checkInfo(
            toRawDeep(repository.value)
          );
          return true;
        } catch (err) {
          renderLogger.error('Failed to check repository', { err });
          error.value = err.message;
          return false;
        } finally {
          ongoing.value = false;
        }
      },
    };
  }

  return {
    repositoriesState,
    isSynced,
    loading,
    useRepositoryImport,
    useRepositoryCheck,
    openRepositoryFolder,
    createRepository,
    updateRepository,
    deleteRepository,
    fetchRepositorySync,
    syncRepository,
    fetchRepositoryModsets,
  };
});
