import type { RepositoriesState } from '~/app/models/repositories/types';

export const useRepositoriesStore = defineStore('repositories', () => {
  const {
    value: repositoriesState,
    isSynced,
    loading,
  } = useIPCBridge<RepositoriesState>('repositories');

  function importRepository(autoConfigUrl: string) {
    return window.ipc.methods.importRepository(autoConfigUrl);
  }

  return {
    repositoriesState,
    isSynced,
    loading,
    importRepository,
  };
});
