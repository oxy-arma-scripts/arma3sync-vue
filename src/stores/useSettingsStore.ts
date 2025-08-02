import type { Settings } from '~/app/models/settings/types';

export const useSettingsStore = defineStore('settings', () => {
  const {
    value: settings,
    isSynced,
    loading,
  } = useIPCBridge<Settings>('settings');

  const isValid = ref(false);

  function openGameFolderDialog() {
    window.ipc.methods.openGameFolderDialog();
  }

  async function openGameFolder() {
    const error = await window.ipc.methods.openGameFolder();
    console.log(error);
  }

  return {
    settings,
    isSynced,
    loading,
    isValid,
    openGameFolderDialog,
    openGameFolder,
  };
});
