import { shell } from 'electron';

import { t } from '~/app/lib/i18n';
import { showOpenDialog } from '~/app/lib/window';

import { getSettings, setSettings } from './state';

/**
 * Open a picker to set where game is located
 */
export async function openGameFolderPicker(): Promise<void> {
  const result = await showOpenDialog({
    title: t('settings.gameFolderPicker.title'),
    properties: ['openDirectory', 'dontAddToRecent'],
  });

  const [gamePath] = result.filePaths;
  if (gamePath) {
    const current = getSettings();
    current.game.path = gamePath;
    setSettings(current);
  }
}

/**
 * Open in native explorer where game is located
 */
export async function openGameFolder(): Promise<void> {
  const err = await shell.openPath(getSettings().game.path);
  if (err) {
    throw new Error(err);
  }
}
