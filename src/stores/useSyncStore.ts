import type { SyncState } from '~/app/models/sync/types';

export const useSyncStore = defineStore('sync', () => {
  const {
    value: syncState,
    isSynced,
    loading,
  } = useIPCBridge<SyncState>('sync');

  function importSyncSource(autoConfigUrl: string) {
    return window.ipc.methods.importSyncSource(autoConfigUrl);
  }

  return {
    syncState,
    isSynced,
    loading,
    importSyncSource,
  };
});
