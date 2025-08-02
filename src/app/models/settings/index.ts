import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

import { app, shell } from 'electron';

import { sendToRender, showOpenDialog } from '~/app/lib/window';
import mainLogger from '~/app/lib/logger';
import { prepareBridge, prepareMethod } from '~/app/lib/bridge';

import type { Settings } from './types';

const logger = mainLogger.scope('app.models.settings');
const configPath = join(app.getPath('userData'), 'settings.json');

let state: Settings = {
  gamePath: '',
  gameParams: {},

  modDirs: [],
};

async function saveSettings() {
  await mkdir(dirname(configPath), { recursive: true });

  try {
    await writeFile(configPath, JSON.stringify(state, undefined, 2));
    logger.info('Settings saved', { configPath });
  } catch (error) {
    logger.error('Failed to save settings', { configPath, error });
    throw error;
  }
}

async function loadSettings() {
  if (!existsSync(configPath)) {
    await saveSettings();
    return;
  }

  try {
    const data = await readFile(configPath, 'utf8');
    state = {
      ...state,
      ...JSON.parse(data),
    };
    sendToRender('bridge:settings', state);
  } catch (error) {
    logger.error('Failed to load settings', { configPath, error });
    throw error;
  }
}

const {
  get: getSettings,
  set: setSettings,
} = prepareBridge(
  'settings',
  logger,
  () => state,
  (v) => {
    state = v;
    saveSettings();
  },
);

// eslint-disable-next-line prefer-arrow-callback
prepareMethod(async function openGameFolderDialog() {
  const result = await showOpenDialog({
    title: 'Select game folder',
    properties: ['openDirectory', 'dontAddToRecent'],
  });

  const [gamePath] = result.filePaths;
  if (gamePath) {
    setSettings({
      ...getSettings(),
      gamePath,
    });
  }
});

// eslint-disable-next-line prefer-arrow-callback
prepareMethod(() => shell.openPath(getSettings().gamePath), 'openGameFolder');

export {
  getSettings,
  setSettings,
  saveSettings,
  loadSettings,
};
