import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

import { app } from 'electron';

import { sendToRender } from '~/app/lib/window';
import mainLogger from '~/app/lib/logger';
import { prepareBridge, prepareMethod } from '~/app/lib/bridge';

import type * as a3syncTypes from '~/app/lib/a3sync/types';
import * as a3sync from '~/app/lib/a3sync/ftp';

import { SyncSource, SyncState } from './types';

const logger = mainLogger.scope('app.models.sync');
const configPath = join(app.getPath('userData'), 'sync.json');

let state: SyncState = {
  sources: [],
};

async function saveState() {
  await mkdir(dirname(configPath), { recursive: true });

  try {
    await writeFile(configPath, JSON.stringify(state, undefined, 2));
    logger.info('Settings saved', { configPath });
  } catch (error) {
    logger.error('Failed to save settings', { configPath, error });
    throw error;
  }
}

async function loadState() {
  if (!existsSync(configPath)) {
    await saveState();
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
  get: getSync,
  set: setSync,
} = prepareBridge(
  'sync',
  logger,
  () => state,
  (v) => {
    state = v;
    saveState();
  },
);

function getSyncSourceFromAutoConfig(autoConfig: a3syncTypes.AutoConfigType[number]): SyncSource {
  const config = autoConfig.protocole;

  // TODO: what if url have protocol ? what if ftps ?
  const url = new URL(`ftp://${config.url}`);
  url.username = config.login;
  url.password = config.password;
  url.port = `${config.port}`;

  return {
    url: url.toString(),
    options: {
      timeout: config.connectionTimeOut,
    },
  };
}

// eslint-disable-next-line prefer-arrow-callback
prepareMethod(async function importSyncSource(publicUrl: string): Promise<SyncSource> {
  const url = new URL(publicUrl);
  const client = await a3sync.getClient(url);
  const [autoConfig] = await a3sync.getAutoConfig(client, url.pathname);
  if (!autoConfig) {
    throw new Error('No config found on server');
  }

  return getSyncSourceFromAutoConfig(autoConfig);
});

export {
  getSync,
  setSync,
  loadState,
};
