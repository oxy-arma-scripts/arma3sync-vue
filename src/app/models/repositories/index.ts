import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

import { app, shell } from 'electron';

import { sendToRender } from '~/app/lib/window';
import mainLogger from '~/app/lib/logger';
import { prepareBridge, prepareMethod } from '~/app/lib/bridge';

import * as a3sync from '~/app/lib/a3sync';

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
  get: getState,
  set: setState,
} = prepareBridge(
  'repositories',
  logger,
  () => state,
  (v) => {
    state = v;
    saveState();
  },
);

function getRepositoryFromAutoConfig(autoConfig: a3sync.AutoConfigType[number]): Omit<Repository, 'destination'> {
  const config = autoConfig.protocole;

  const url = new URL(`${config.protocolType}://${config.url}`);
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
  url.pathname = url.pathname.replace(/\/\.a3s\/autoconfig\/?/i, '/');

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

// eslint-disable-next-line prefer-arrow-callback
prepareMethod(async function checkRepository(repository: Repository) {
  const url = new URL(repository.url);
  let client;
  try {
    client = await a3sync.getClient(url);
  } catch (e) {
    throw new Error('Failed to connect to server', { cause: e });
  }

  try {
    await a3sync.getServerInfo(client, url.pathname);
  } catch (e) {
    throw new Error('Failed to get server info', { cause: e });
  }

  return true;
});

prepareMethod((repository: Repository) => shell.openPath(repository.destination), 'openRepositoryFolder');

// eslint-disable-next-line prefer-arrow-callback
prepareMethod(async function addRepository(repository: Repository) {
  state.repositories = [...new Map(
    [
      ...state.repositories,
      repository,
    ].map((r) => [r.destination, r]),
  ).values()];

  setState(state);
});

// eslint-disable-next-line prefer-arrow-callback
prepareMethod(async function editRepository(repository: Repository) {
  const index = state.repositories.findIndex(
    ({ destination }) => destination === repository.destination,
  );
  if (index < 0) {
    return;
  }

  state.repositories[index] = {
    ...repository,
    destination: state.repositories[index].destination,
  };

  setState(state);
});

// eslint-disable-next-line prefer-arrow-callback
prepareMethod(async function removeRepository(repository: Repository) {
  state.repositories = state.repositories.filter(
    ({ destination }) => destination !== repository.destination,
  );

  setState(state);
});

export {
  getState as getSync,
  setState as setSync,
  loadState as loadRepositories,
};
