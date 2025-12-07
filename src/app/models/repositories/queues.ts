import { resolve as resolvePath, sep, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, unlink } from 'node:fs/promises';

import { promise as createQueue } from 'fastq';

import { downloadFile, type A3SClient } from '~/app/lib/a3sync';

import type { FlatSyncItem } from './utils';

import type {
  Repository,
  RepositorySyncItem,
  FetchQueueStatus,
  SyncQueueStatus,
} from './types';

// Status of queue for each repository
export const checkStatus: Record<string, FetchQueueStatus> = {};

const regexModFromPath = new RegExp(`(?<path>.*(?<name>@[^${sep}]+))`, 'i');

type FileCheckTask = {
  repository: Repository;
  absolutePath: string;
  relativePath: string;
  syncItem: FlatSyncItem | null;
};

// Queue used to get what changed between a local and a remote file
const fileCheckQueue = createQueue(
  async (task: FileCheckTask): Promise<RepositorySyncItem> => {
    if (!task.syncItem) {
      const matches = regexModFromPath.exec(task.relativePath);

      return {
        type: 'DELETE',
        path: task.relativePath,
        size: 0,
        mod: {
          name: matches.groups?.name || '',
          path: matches.groups?.path || '',
        },
      };
    }

    createReadStream(task.absolutePath)
      .pipe(createHash('sha1'))
      .setEncoding('hex');

    // oxlint-disable-next-line avoid-new
    const sha1 = await new Promise<string>((resolve, reject) => {
      const stream = createReadStream(task.absolutePath)
        .pipe(createHash('sha1'))
        .setEncoding('hex');

      let hash = '';
      stream.on('error', (err) => reject(err));
      stream.on('data', (chunk) => {
        hash += chunk;
      });
      stream.on('end', () => resolve(hash));
    });

    return {
      type: sha1 === task.syncItem.sha1 ? 'UNCHANGED' : 'UPDATE',
      path: task.relativePath,
      size: task.syncItem.size,
      mod: task.syncItem.mod,
    };
  },
  4
);

/**
 * Check what changed between the local and the remote version
 *
 * @param task - The file and other parameters
 *
 * @returns The action needed to make it synced
 */
export async function addToFileCheckQueue(
  task: FileCheckTask
): Promise<RepositorySyncItem> {
  // State is scoped by repository
  let queueState = checkStatus[task.repository.name];

  // If queue isn't active, reset it state
  if (!queueState?.active) {
    queueState = {
      active: true,
      done: 0,
      total: 0,
    };
    checkStatus[task.repository.name] = queueState;
  }

  queueState.total += 1;

  const data = await fileCheckQueue.push(task);

  queueState.done += 1;
  queueState.active = fileCheckQueue.length() > 0;

  return data;
}

// Status of queue for each repository
export const syncStatus: Record<string, SyncQueueStatus> = {};

type FileSyncTask = {
  repository: Repository;
  client: A3SClient;
  item: RepositorySyncItem;
};

// Queue used to apply changes between a local and remote file
const fileSyncQueue = createQueue(async (task: FileSyncTask): Promise<void> => {
  const source = task.item.path;
  const destination = resolvePath(task.repository.destination, task.item.path);

  if (task.item.type === 'DELETE') {
    await unlink(destination);
    return;
  }

  await mkdir(dirname(destination), { recursive: true });
  await downloadFile(task.client, source, destination);
}, 4);

/**
 * Apply changes between the local and the remote version of a file
 *
 * @param task - The file and other parameters
 */
export async function addToFileSyncQueue(task: FileSyncTask): Promise<void> {
  let queueState = syncStatus[task.repository.name];

  if (!queueState?.active) {
    queueState = {
      active: true,
      done: 0,
      total: 0,
    };
    syncStatus[task.repository.name] = queueState;
  }

  queueState.total += 1;

  const data = await fileSyncQueue.push(task);

  queueState.done += 1;
  queueState.active = fileSyncQueue.length() > 0;

  return data;
}
