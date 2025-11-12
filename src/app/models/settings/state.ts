import { sep as pathSeparator } from 'node:path';

import { createFileDB } from '~/app/lib/lowdb';
import { i18n } from '~/app/lib/i18n';
import { sendToRender } from '~/app/lib/window';
import { mainLogger } from '~/app/lib/logger';
import { prepareBridge } from '~/app/lib/bridge';

import type { ComputedSettings, Settings } from './types';

const logger = mainLogger.scope('app.models.settings');

/**
 * Current state
 */
const db = createFileDB<Settings>('settings.json', {
  game: {
    path: '',
    params: {},
  },

  display: {
    theme: 'auto',
    language: null, // let browser decide
  },
});

/**
 * Save state as file
 */
async function saveState(): Promise<void> {
  try {
    await db.write();
    logger.info('Settings saved', { dbPath: db.path });
  } catch (error) {
    logger.error('Failed to save settings', { dbPath: db.path, error });
    throw error;
  }
}

/**
 * Load state from file
 */
async function loadState(): Promise<void> {
  try {
    await db.read();
    if (db.data.display.language) {
      i18n.setLocale(db.data.display.language);
    }
    sendToRender('bridge:settings', db.data);
  } catch (error) {
    logger.error('Failed to load settings', { dbPath: db.path, error });
    throw error;
  }
}

/**
 * Setup IPC bridge for state
 */
const { get: getState, set: setState } = prepareBridge<ComputedSettings>(
  'settings',
  logger,
  () => ({
    ...db.data,
    pathSeparator,
  }),
  ({ pathSeparator: _s, ...value }) => {
    db.data = value;
    if (value.display.language) {
      i18n.setLocale(value.display.language);
    }
    saveState();
  }
);

export {
  getState as getSettings,
  setState as setSettings,
  loadState as loadSettings,
};
