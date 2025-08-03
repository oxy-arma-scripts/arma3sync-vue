import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

import { app } from 'electron';

import { sendToRender } from '~/app/lib/window';
import mainLogger from '~/app/lib/logger';
import { prepareBridge, prepareMethod } from '~/app/lib/bridge';

import type * as a3syncTypes from '~/app/lib/a3sync/types';
import * as a3sync from '~/app/lib/a3sync/ftp';

import { Repository, RepositoriesState } from './types';

const logger = mainLogger.scope('app.models.sync');
const configPath = join(app.getPath('userData'), 'repositories.json');

let state: RepositoriesState = {
  repositories: [],
};

async function saveState() {
  await mkdir(dirname(configPath), { recursive: true });

  try {
    await writeFile(configPath, JSON.stringify(state, undefined, 2));
    logger.info('Repositories saved', { configPath });
  } catch (error) {
    logger.error('Failed to save repositories', { configPath, error });
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
    sendToRender('bridge:sync', state);
  } catch (error) {
    logger.error('Failed to load repositories', { configPath, error });
    throw error;
  }
}

const {
  get: getSync,
  set: setSync,
} = prepareBridge(
  'repositories',
  logger,
  () => state,
  (v) => {
    state = v;
    saveState();
  },
);

function getRepositoryFromAutoConfig(autoConfig: a3syncTypes.AutoConfigType[number]): Omit<Repository, 'destination'> {
  const config = autoConfig.protocole;

  // TODO: what if url have protocol ? what if ftps ?
  const url = new URL(`ftp://${config.url}`);
  url.username = config.login;
  url.password = config.password;
  url.port = `${config.port}`;

  return {
    name: autoConfig.repositoryName,
    url: url.toString(),
    options: {
      timeout: config.connectionTimeOut,
    },
  };
}

// eslint-disable-next-line prefer-arrow-callback
prepareMethod(async function importRepository(publicUrl: string): Promise<Omit<Repository, 'destination'>> {
  const url = new URL(publicUrl);

  let client;
  try {
    client = await a3sync.getClient(url);
  } catch (e) {
    throw new Error('Failed to connect to server', { cause: e });
  }

  let autoConfig;
  try {
    ([autoConfig] = await a3sync.getAutoConfig(client, url.pathname));
  } catch (e) {
    throw new Error('Failed to get autoconfig', { cause: e });
  }

  if (!autoConfig) {
    throw new Error('No config found on server');
  }

  return getRepositoryFromAutoConfig(autoConfig);
});

export {
  getSync,
  setSync,
  loadState as loadRepositories,
};
