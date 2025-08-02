import type { Settings } from '~/app/models/settings/types';

import logger from '~/lib/logger';

export const useSettingsStore = defineStore('settings', () => {
  const {
    value: settings,
    isSynced,
    loading,
  } = useIPCBridge<Settings>('settings');

  const isValid = ref(false);

  function openGameFolderPicker() {
    window.ipc.methods.openGameFolderPicker();
  }

  async function openGameFolder() {
    const error = await window.ipc.methods.openGameFolder();
    if (error) {
      logger.error('Failed to open game folder', { error });
    }
  }

  return {
    settings,
    isSynced,
    loading,
    isValid,
    openGameFolderPicker,
    openGameFolder,
  };
});
