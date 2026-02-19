import { t } from '~/app/lib/i18n';
import { createFileDB } from '~/app/lib/lowdb';
import { sendToRender } from '~/app/lib/window';
import { mainLogger } from '~/app/lib/logger';
import { prepareBridge } from '~/app/lib/bridge';

import { getRepositories } from '~/app/models/repositories';
import { fetchRepositoryGameServers } from '~/app/models/repositories/actions';

import type { GameServer, GameServersState } from './types';

const logger = mainLogger.scope('app.models.game-servers');

/**
 * Current state
 */
const db = createFileDB<GameServersState>('game-servers.json', {
  servers: [],
});

/**
 * Save state as file
 */
async function saveState(): Promise<void> {
  try {
    await db.write();
    logger.info('Game servers saved', { dbPath: db.path });
  } catch (error) {
    logger.error('Failed to save game servers', {
      dbPath: db.path,
      error,
    });
    throw error;
  }
}

/**
 * Load state from file
 */
async function loadState(): Promise<void> {
  try {
    await db.read();
    sendToRender('bridge:game-servers', db.data);
  } catch (error) {
    logger.error('Failed to load game servers', {
      dbPath: db.path,
      error,
    });
    throw error;
  }
}

/**
 * Setup IPC bridge for state
 */
const { get: getState, set: setState } = prepareBridge(
  'game-servers',
  logger,
  () => db.data,
  (value) => {
    db.data = value;
    saveState();
  }
);

export { getState as getGameServers, setState as setGameServers };

/**
 * Load game servers and refresh them if they're coming from a repository
 *
 * Triggers a load and save
 */
export async function loadGameServers(): Promise<void> {
  await loadState();

  const repoState = getRepositories();
  const repositories = new Map(
    repoState.repositories.map((repo) => [repo.name, repo])
  );

  const perRepo = Map.groupBy(db.data.servers, (item) => item.repository?.name);

  const promises = [...perRepo.keys()].map(async (repoName) => {
    const repository = repositories.get(repoName);
    if (!repository) {
      return [];
    }

    let remoteServers;
    try {
      remoteServers = await fetchRepositoryGameServers(repository);
    } catch (error) {
      logger.error('Failed to list gameServers from repository', {
        repository,
        error,
      });
      return [];
    }

    return remoteServers.filter((remoteSet) =>
      db.data.servers.some(
        (serv) =>
          serv.repository?.name === repository.name &&
          (serv.name === remoteSet.name ||
            serv.name === `${serv.name} (${repository.name})`)
      )
    );
  });

  const gameServersToAdd = await Promise.all(promises);

  db.data.servers = [
    ...db.data.servers.filter((srv) => !srv.repository),
    ...gameServersToAdd.flat(),
  ];

  logger.info('Game servers refreshed');
  saveState();
}

/**
 * Add a game server
 *
 * Triggers a save
 *
 * @param server - The configuration
 */
export function addGameServer(server: GameServer): void {
  const state = getState();

  const serverMap = new Map(state.servers.map((srv) => [srv.name, srv]));

  // Check if already exists
  const existingSet = serverMap.get(server.name);
  if (existingSet) {
    // If new server doesn't have a source and the found one have it, reject
    if (!server.repository?.name && existingSet.repository?.name) {
      throw new Error(t('gameServers.errors.readonly'));
    }
    // If new server have a source, change name
    if (
      server.repository?.name &&
      server.repository.name !== existingSet.repository?.name
    ) {
      server.name = `${server.name} (${server.repository.name})`;
    }
  }

  serverMap.set(server.name, server);
  state.servers = [...serverMap.values()];

  setState(state);
}

/**
 * Update a game server
 *
 * Triggers a save
 *
 * @param server - The configuration
 */
export function editGameServer(server: GameServer): void {
  const state = getState();

  const serverMap = new Map(state.servers.map((srv) => [srv.name, srv]));

  // Check if already exists
  const existingServer = serverMap.get(server.name);
  if (!existingServer) {
    return;
  }
  // If new gameServer doesn't have a source and the found one have it, reject
  if (!server.repository?.name && existingServer.repository?.name) {
    throw new Error(t('gameServers.errors.readonly'));
  }
  // If new gameServer have a source but doesn't match, do nothing
  if (
    server.repository.name &&
    server.repository.name !== existingServer.repository?.name
  ) {
    return;
  }

  serverMap.set(server.name, server);
  state.servers = [...serverMap.values()];

  setState(state);
}

/**
 * Delete a game server
 *
 * Triggers a save
 *
 * @param server - The configuration
 */
export function removeGameServer(server: GameServer): void {
  const state = getState();

  state.servers = state.servers.filter(({ name }) => name !== server.name);

  setState(state);
}
