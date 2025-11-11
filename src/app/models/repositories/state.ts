import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

import { app } from 'electron';

import { sendToRender } from '~/app/lib/window';
import { mainLogger } from '~/app/lib/logger';
import { prepareBridge } from '~/app/lib/bridge';

import type { RepositoriesState, Repository } from './types';

import { checkStatus, syncStatus } from './queues';

const logger = mainLogger.scope('app.models.sync');
const configPath = join(app.getPath('userData'), 'repositories.json');

/**
 * Current state
 */
let state: RepositoriesState = {
  repositories: [],
  checkStatus,
  syncStatus,
};

/**
 * Save state as file
 */
async function saveState(): Promise<void> {
  await mkdir(dirname(configPath), { recursive: true });

  try {
    await writeFile(
      configPath,
      JSON.stringify(
        {
          ...state,
          // Remove runtime-only state
          checkStatus: undefined,
          syncStatus: undefined,
        },
        undefined,
        2
      )
    );
    logger.info('Repositories saved', { configPath });
  } catch (error) {
    logger.error('Failed to save repositories', { configPath, error });
    throw error;
  }
}

/**
 * Load state from file
 */
async function loadState(): Promise<void> {
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

    sendToRender('bridge:repositories', state);
  } catch (error) {
    logger.error('Failed to load repositories', { configPath, error });
    throw error;
  }
}

/**
 * Setup IPC bridge for state
 */
const { get: getState, set: setState } = prepareBridge(
  'repositories',
  logger,
  () => state,
  (value) => {
    state = value;
    saveState();
  }
);

export {
  getState as getSync,
  setState as setSync,
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
  state.repositories = state.repositories.filter(
    ({ destination }) => destination !== repository.destination
  );

  setState(state);
}
