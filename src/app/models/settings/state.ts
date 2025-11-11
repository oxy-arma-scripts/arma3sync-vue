import { dirname, join, sep } from 'node:path';
import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

import { app } from 'electron';

import { i18n } from '~/app/lib/i18n';
import { sendToRender } from '~/app/lib/window';
import { mainLogger } from '~/app/lib/logger';
import { prepareBridge } from '~/app/lib/bridge';

import type { Settings } from './types';

const logger = mainLogger.scope('app.models.settings');
const configPath = join(app.getPath('userData'), 'settings.json');

/**
 * Current state
 */
let state: Settings = {
  game: {
    path: '',
    params: {},
  },

  display: {
    theme: 'auto',
    language: null, // let browser decide
  },

  pathSeparator: sep,
};

/**
 * Save state as file
 */
async function saveState(): Promise<void> {
  await mkdir(dirname(configPath), { recursive: true });

  try {
    await writeFile(configPath, JSON.stringify(state, undefined, 2));
    logger.info('Settings saved', { configPath });
  } catch (error) {
    logger.error('Failed to save settings', { configPath, error });
    throw error;
  }
}

/**
 * Load state from file
 */
async function loadState(): Promise<void> {
  if (!existsSync(configPath)) {
    await saveState();
    return;
  }

  try {
    const data = await readFile(configPath, 'utf8');
    state = {
      ...state,
      ...JSON.parse(data),
      pathSeparator: sep,
    };
    if (state.display.language) {
      i18n.setLocale(state.display.language);
    }
    sendToRender('bridge:settings', state);
  } catch (error) {
    logger.error('Failed to load settings', { configPath, error });
    throw error;
  }
}

/**
 * Setup IPC bridge for state
 */
const { get: getSettings, set: setSettings } = prepareBridge(
  'settings',
  logger,
  () => state,
  (value) => {
    state = value;
    if (value.display.language) {
      i18n.setLocale(value.display.language);
    }
    saveState();
  }
);

export {
  getSettings,
  setSettings,
  saveState as saveSettings,
  loadState as loadSettings,
};
