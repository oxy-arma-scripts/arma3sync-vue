import { dirname, join } from 'node:path';
import { createReadStream, existsSync } from 'node:fs';
import {
  readFile, writeFile, mkdir, glob,
} from 'node:fs/promises';

import { app } from 'electron';

import { sendToRender } from '~/app/lib/window';
import mainLogger from '~/app/lib/logger';
import { prepareBridge } from '~/app/lib/bridge';

import * as a3sync from '~/app/lib/a3sync';

import { createHash } from 'node:crypto';
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

export {
  getState as getSync,
  setState as setSync,
  loadState as loadRepositories,
};

export function getRepositoryFromAutoConfig(autoConfig: a3sync.AutoConfigType[number]): Omit<Repository, 'destination'> {
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

export async function importRepository(publicUrl: string): Promise<Omit<Repository, 'destination'>> {
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
    ([autoConfig] = await a3sync.getAutoConfig(client));
  } catch (e) {
    throw new Error('Failed to get autoconfig', { cause: e });
  }

  if (!autoConfig) {
    throw new Error('No config found on server');
  }

  return getRepositoryFromAutoConfig(autoConfig);
}

async function getA3SClientFromRepository(repository: Repository) {
  const url = new URL(repository.url);
  try {
    return await a3sync.getClient(url);
  } catch (e) {
    throw new Error('Failed to connect to server', { cause: e });
  }
}

export async function checkRepository(repository: Repository) {
  const client = await getA3SClientFromRepository(repository);

  try {
    await a3sync.getServerInfo(client);
  } catch (e) {
    throw new Error('Failed to get server info', { cause: e });
  }

  return true;
}

const flattenSync = (sync: a3sync.SyncType, root = '.') => sync.flatMap(
  (syncItem): { path: string, size: number, sha1: string }[] => {
    const path = join(root, syncItem.name === 'racine' ? '.' : syncItem.name);

    if ('sha1' in syncItem) {
      return [{
        path,
        size: syncItem.size.low,
        sha1: syncItem.sha1,
      }];
    }

    return flattenSync(syncItem.list.list ?? [], path);
  },
);

export async function syncRepository(repository: Repository) {
  const client = await getA3SClientFromRepository(repository);

  let sync;
  try {
    sync = await a3sync.getSync(client);
  } catch (e) {
    throw new Error('Failed to get sync', { cause: e });
  }

  const filesFromSync = new Map(
    flattenSync(sync, repository.destination)
      .map((item) => [item.path, item]),
  );

  const filesOnDisk = glob(join(repository.destination, '**/*'), {
    withFileTypes: true,
  });

  // TODO: parallel
  // eslint-disable-next-line no-restricted-syntax
  for await (const file of filesOnDisk) {
    if (!file.isFile()) {
      // eslint-disable-next-line no-continue
      continue;
    }

    const path = join(file.parentPath, file.name);
    const syncItem = filesFromSync.get(path);
    if (!syncItem) {
      // TODO: delete
    }

    // Item was found, no need to keep it
    filesFromSync.delete(path);

    const sha1 = createReadStream(path)
      .pipe(createHash('sha1'))
      .digest('hex');

    if (sha1 !== syncItem?.sha1) {
      // TODO: update
    }
  }

  // TODO: parallel
  // eslint-disable-next-line no-restricted-syntax
  for await (const item of filesFromSync.values()) {
    // TODO: create
  }
}

export async function addRepository(repository: Repository) {
  state.repositories = [...new Map(
    [
      ...state.repositories,
      repository,
    ].map((r) => [r.destination, r]),
  ).values()];

  setState(state);
}

export async function editRepository(repository: Repository) {
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
}

export async function removeRepository(repository: Repository) {
  state.repositories = state.repositories.filter(
    ({ destination }) => destination !== repository.destination,
  );

  setState(state);
}
