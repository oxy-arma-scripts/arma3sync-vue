import { join } from 'node:path';

import {
  getClient,
  type SyncType,
  type AutoConfigType,
} from '~/app/lib/a3sync';

import type { Repository } from './types';

/**
 * Get Repository from A3S autoconfig file
 *
 * @param autoConfig - The autoconfig from the remote
 *
 * @returns A configured Repository (without destination, user will need to provide it)
 */
export function getRepositoryFromAutoConfig(
  autoConfig: AutoConfigType[number]
): Omit<Repository, 'destination'> {
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

/**
 * Get A3S Client from Repository configuration
 *
 * @param repository - The Repository configuration
 *
 * @returns The A3S Client ready to be used
 */
export async function getA3SClientFromRepository(repository: Repository) {
  const url = new URL(repository.url);
  try {
    return await getClient(url);
  } catch (err) {
    throw new Error('Failed to connect to server', { cause: err });
  }
}

export type FlatSyncItem = {
  path: string;
  sha1: string;
  size: number;
  mod: {
    name: string;
    path: string;
  };
};

/**
 * Flatten A3S sync file into an array of depth 1
 *
 * @param sync - The sync from remote
 * @param root - The root path (default to `.`)
 * @param parent - The last mod found - Meant for internal used
 *
 * @returns The list of files present in sync
 */
export function flattenSync(
  sync: SyncType,
  root = '.',
  parent?: { name: string; path: string }
): FlatSyncItem[] {
  return sync.flatMap((syncItem): FlatSyncItem[] => {
    const path = join(root, syncItem.name === 'racine' ? '.' : syncItem.name);

    // If sha1 is present, it's a file (leaf)
    if ('sha1' in syncItem) {
      return [
        {
          path,
          sha1: syncItem.sha1,
          size: syncItem.size.high,
          mod: parent,
        },
      ];
    }

    let mod = parent;
    // If sync tells us to mark it as mod, we keep it as parent
    if (syncItem.markAsAddon) {
      mod = { name: syncItem.name, path };
    }

    // Otherwise, go deeper in tree
    return flattenSync(syncItem.list.list ?? [], path, mod);
  });
}
