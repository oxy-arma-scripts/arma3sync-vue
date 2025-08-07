import type { RepositoriesState, Repository } from '~/app/models/repositories/types';

import logger from '~/lib/logger';
import toRawDeep from '~/utils/toRawDeep';

export const useRepositoriesStore = defineStore('repositories', () => {
  const {
    value: repositoriesState,
    isSynced,
    loading,
  } = useIPCBridge<RepositoriesState>('repositories');

  function useRepositoryImport() {
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
          const repo = await window.ipc.methods.importRepository(url.value);
          changed.value = false;
          return { ...repo, destination: '' };
        } catch (err) {
          logger.error('Failed to import repository', { err });
          error.value = err.message;
          return null;
        } finally {
          ongoing.value = false;
        }
      },
    };
  }

  function useRepositoryCheck(repository: Ref<Repository>) {
    const ongoing = shallowRef(false);
    const error = shallowRef('');

    return {
      loading: computed(() => ongoing.value),
      error: computed(() => error.value),
      checkRepo: async (): Promise<boolean> => {
        ongoing.value = true;
        error.value = '';
        try {
          await window.ipc.methods.checkRepository(toRawDeep(repository.value));
          return true;
        } catch (err) {
          logger.error('Failed to check repository', { err });
          error.value = err.message;
          return false;
        } finally {
          ongoing.value = false;
        }
      },
    };
  }

  async function createRepository(repository: Repository) {
    await window.ipc.methods.addRepository(toRawDeep(repository));
  }

  async function updateRepository(repository: Repository) {
    await window.ipc.methods.editRepository(toRawDeep(repository));
  }

  async function deleteRepository(repository: Repository) {
    await window.ipc.methods.removeRepository(toRawDeep(repository));
  }

  async function openRepositoryFolder(source: Repository) {
    const error = await window.ipc.methods.openRepositoryFolder(toRawDeep(source));
    if (error) {
      logger.error('Failed to open repository folder', { error });
    }
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
  };
});
