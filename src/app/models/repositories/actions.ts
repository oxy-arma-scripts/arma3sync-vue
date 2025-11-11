import { join, relative } from 'node:path';
import { glob } from 'node:fs/promises';

import { sendToRender } from '~/app/lib/window';
import mainLogger from '~/app/lib/logger';

import * as a3sync from '~/app/lib/a3sync';

import type { Repository, RepositorySyncItem } from './types';

import { getSync } from './state';
import { addToFileCheckQueue, addToFileSyncQueue } from './queues';

import { flattenSync, getA3SClientFromRepository, getRepositoryFromAutoConfig } from './utils';

const logger = mainLogger.scope('app.models.sync');

/**
 * Get Repository from A3S remote
 *
 * @param publicUrl - URL towards remote (if `/.a3s/autoconfig` is found, it will be ignored)
 *
 * @returns A configured Repository (without destination, user will need to provide it)
 */
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

/**
 * Check if Repository configuration is valid by getting the info of the remote
 *
 * @param repository - Repository configuration
 *
 * @returns If configuration is valid
 */
export async function checkRepository(repository: Repository): Promise<boolean> {
  const client = await getA3SClientFromRepository(repository);

  try {
    await a3sync.getServerInfo(client);
  } catch (e) {
    throw new Error('Failed to get server info', { cause: e });
  }

  return true;
}

/**
 * Get difference between a local Repository and remote
 *
 * @param repository - The repository to check
 *
 * @returns The difference
 */
export async function fetchRepository(repository: Repository): Promise<RepositorySyncItem[]> {
  const client = await getA3SClientFromRepository(repository);

  logger.info('Getting sync file from remote...', { repository });

  let sync;
  try {
    sync = await a3sync.getSync(client);
  } catch (e) {
    throw new Error('Failed to get sync', { cause: e });
  }

  const filesFromSync = new Map(
    flattenSync(sync)
      .map((item) => [item.path, item]),
  );

  logger.info('Sync data is ready to be used, scanning destination...', {
    repository,
    filesFromSync: filesFromSync.size,
  });

  const filesOnDisk = glob(join(repository.destination, '**/*'), {
    withFileTypes: true,
  });

  let lastNotification = Date.now();
  const notifier = (data: RepositorySyncItem): RepositorySyncItem => {
    const now = Date.now();
    // Notify every 2 seconds
    if (now - (lastNotification ?? 0) > 2 * 1000) {
      sendToRender('bridge:repositories', getSync());
      lastNotification = now;
    }
    return data;
  };

  const tasks = [];

  // eslint-disable-next-line no-restricted-syntax
  for await (const file of filesOnDisk) {
    if (!file.isFile()) {
      // eslint-disable-next-line no-continue
      continue;
    }

    const absolutePath = join(file.parentPath, file.name);
    const relativePath = relative(repository.destination, absolutePath);

    const syncItem = filesFromSync.get(relativePath);

    // Generate tasks from files present in file system
    tasks.push(
      addToFileCheckQueue({
        repository,
        absolutePath,
        relativePath,
        syncItem,

      })
        // Notify renderer about progression
        .then(notifier),
    );
  }

  logger.info('Tasks placed in queue, waiting for them to finish', {
    repository,
    tasks: tasks.length,
  });

  // Wait for tasks
  const operations = await Promise.all(tasks);

  // eslint-disable-next-line no-restricted-syntax
  for (const item of operations) {
    filesFromSync.delete(item.path);
  }

  // Add missing files as operations
  // eslint-disable-next-line no-restricted-syntax
  for (const item of filesFromSync.values()) {
    operations.push({
      type: 'CREATE',
      path: item.path,
      mod: item.mod,
      size: item.size,
    });
  }

  logger.info('Fetch complete', {
    repository,
    operations: operations.length,
  });

  sendToRender('bridge:repositories', getSync());

  return operations;
}

/**
 * Remove files not present in remote, download updates and missing files
 *
 * @param repository - The Repository configuration
 * @param diff - The items we need to do (`UNCHANGED` items will be ignoreed)
 */
export async function syncRepository(
  repository: Repository,
  diff: RepositorySyncItem[],
): Promise<void> {
  const client = await getA3SClientFromRepository(repository);

  let lastNotification: number | undefined;
  const notifier = (): void => {
    const now = Date.now();
    // Notify every 2 seconds
    if (now - (lastNotification ?? 0) > 2 * 1000) {
      sendToRender('bridge:repositories', getSync());
      lastNotification = now;
    }
  };

  logger.info('Starting sync...', {
    repository,
    filesFromSync: diff.length,
  });

  const tasks = [];
  const toDo = diff
    .filter(({ type }) => type !== 'UNCHANGED')
    .sort((a, b) => a.path.localeCompare(b.path));

  // eslint-disable-next-line no-restricted-syntax
  for (const item of toDo) {
    // Generate tasks from files present in file system
    tasks.push(
      addToFileSyncQueue({
        repository,
        client,
        item,
      })
        // Notify renderer about progression
        .then(notifier),
    );
  }

  logger.info('Tasks placed in queue, waiting for them to finish', {
    repository,
    tasks: tasks.length,
  });

  // Wait for tasks
  await Promise.all(tasks);

  logger.info('Sync complete', { repository });

  sendToRender('bridge:repositories', getSync());
}
