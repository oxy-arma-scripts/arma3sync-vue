import { useTheme } from 'vuetify';

import type { Settings } from '~/app/models/settings/types';

import { renderLogger } from '~/lib/logger';

async function openGameFolderPicker(): Promise<void> {
  try {
    await window.ipc.methods.openGameFolderPicker();
  } catch (err) {
    renderLogger.error('Failed to pick game folder', { err });
  }
}

async function openGameFolder(): Promise<void> {
  try {
    await window.ipc.methods.openGameFolder();
  } catch (err) {
    renderLogger.error('Failed to open game folder', { err });
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const {
    value: settings,
    isSynced,
    loading,
  } = useIPCBridge<Settings>('settings');

  const prefersDark = usePreferredDark();
  const prefersLanguage = usePreferredLanguages();
  const vuetifyTheme = useTheme();
  const { locale } = useI18n();

  const isValid = shallowRef(true);

  watch(
    () => settings.value?.display.theme,
    () => {
      if ((settings.value?.display.theme ?? 'auto') !== 'auto') {
        vuetifyTheme.change(settings.value.display.theme);
        return;
      }
      vuetifyTheme.change(prefersDark.value ? 'dark' : 'light');
    },
    { immediate: true }
  );

  watch(
    () => settings.value?.display.language,
    () => {
      if (!settings.value) {
        return;
      }

      if (settings.value.display.language) {
        locale.value = settings.value.display.language;
        return;
      }

      const autoLang = prefersLanguage.value?.[0]?.slice(0, 2) || 'en';
      locale.value = autoLang;
      settings.value.display.language = autoLang;
    },
    { immediate: true }
  );

  return {
    settings,
    isSynced,
    loading,
    isValid,
    openGameFolderPicker,
    openGameFolder,
  };
});
