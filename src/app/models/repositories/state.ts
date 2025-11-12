import { createFileDB } from '~/app/lib/lowdb';
import { sendToRender } from '~/app/lib/window';
import { mainLogger } from '~/app/lib/logger';
import { prepareBridge } from '~/app/lib/bridge';

import type {
  ComputedRepositoriesState,
  RepositoriesState,
  Repository,
} from './types';

import { checkStatus, syncStatus } from './queues';

const logger = mainLogger.scope('app.models.repositories');

/**
 * Current state
 */
const db = createFileDB<RepositoriesState>('repositories.json', {
  repositories: [],
});

/**
 * Save state as file
 */
async function saveState(): Promise<void> {
  try {
    await db.write();
    logger.info('Repositories saved', { dbPath: db.path });
  } catch (error) {
    logger.error('Failed to save repositories', {
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
    sendToRender('bridge:repositories', db.data);
  } catch (error) {
    logger.error('Failed to load repositories', {
      dbPath: db.path,
      error,
    });
    throw error;
  }
}

/**
 * Setup IPC bridge for state
 */
const { get: getState, set: setState } =
  prepareBridge<ComputedRepositoriesState>(
    'repositories',
    logger,
    () => ({
      ...db.data,
      checkStatus,
      syncStatus,
    }),
    ({ checkStatus: _c, syncStatus: _s, ...value }) => {
      db.data = value;
      saveState();
    }
  );

export {
  getState as getRepositories,
  setState as setRepositories,
  loadState as loadRepositories,
};

/**
 * Add a repository
 *
 * Triggers a save
 *
 * @param repository - The configuration
 */
export function addRepository(repository: Repository): void {
  const state = getState();

  state.repositories = [
    ...new Map(
      [...state.repositories, repository].map((repo) => [
        repo.destination,
        repo,
      ])
    ).values(),
  ];

  setState(state);
}

/**
 * Update a repository
 *
 * Triggers a save
 *
 * @param repository - The configuration
 */
export function editRepository(repository: Repository): void {
  const state = getState();

  const index = state.repositories.findIndex(
    ({ destination }) => destination === repository.destination
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

/**
 * Delete a repository
 *
 * Triggers a save
 *
 * @param repository - The configuration
 */
export function removeRepository(repository: Repository): void {
  const state = getState();

  state.repositories = state.repositories.filter(
    ({ destination }) => destination !== repository.destination
  );

  setState(state);
}
