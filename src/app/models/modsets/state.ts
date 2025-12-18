import { t } from '~/app/lib/i18n';
import { createFileDB } from '~/app/lib/lowdb';
import { sendToRender } from '~/app/lib/window';
import { mainLogger } from '~/app/lib/logger';
import { prepareBridge } from '~/app/lib/bridge';

import { getRepositories } from '~/app/models/repositories';
import { fetchRepositoryModsets } from '~/app/models/repositories/actions';

import type { Modset, ModsetsState } from './types';

const logger = mainLogger.scope('app.models.modsets');

/**
 * Current state
 */
const db = createFileDB<ModsetsState>('modsets.json', {
  modsets: [],
});

/**
 * Save state as file
 */
async function saveState(): Promise<void> {
  try {
    await db.write();
    logger.info('Modsets saved', { dbPath: db.path });
  } catch (error) {
    logger.error('Failed to save modsets', {
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
    sendToRender('bridge:modsets', db.data);
  } catch (error) {
    logger.error('Failed to load modsets', {
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
  'modsets',
  logger,
  () => db.data,
  (value) => {
    db.data = value;
    saveState();
  }
);

export { getState as getModsets, setState as setModsets };

/**
 * Load modsets and refresh them if they're coming from a repository
 *
 * Triggers a load and save
 */
export async function loadModsets(): Promise<void> {
  await loadState();

  const repoState = getRepositories();
  const repositories = new Map(
    repoState.repositories.map((repo) => [repo.name, repo])
  );

  const perRepo = Map.groupBy(db.data.modsets, (item) => item.repository?.name);

  const promises = [...perRepo.keys()].map(async (repoName) => {
    const repository = repositories.get(repoName);
    if (!repository) {
      return [];
    }

    let remoteSets;
    try {
      remoteSets = await fetchRepositoryModsets(repository);
    } catch (error) {
      logger.error('Failed to list modsets from repository', {
        repository,
        error,
      });
      return [];
    }

    return remoteSets.filter((remoteSet) =>
      db.data.modsets.some(
        (set) =>
          set.repository?.name === repository.name &&
          (set.name === remoteSet.name ||
            set.name === `${set.name} (${repository.name})`)
      )
    );
  });

  const modsetsToAdd = await Promise.all(promises);

  db.data.modsets = [
    ...db.data.modsets.filter((set) => !set.repository),
    ...modsetsToAdd.flat(),
  ];

  logger.info('Modsets refreshed');
  saveState();
}

/**
 * Add a modset
 *
 * Triggers a save
 *
 * @param modset - The configuration
 */
export function addModset(modset: Modset): void {
  const state = getState();

  const modsetMap = new Map(state.modsets.map((set) => [set.name, set]));

  // Check if already exists
  const existingSet = modsetMap.get(modset.name);
  if (existingSet) {
    // If new modset doesn't have a source and the found one have it, reject
    if (!modset.repository?.name && existingSet.repository?.name) {
      throw new Error(t('modsets.errors.readonly'));
    }
    // If new modset have a source, change name
    if (
      modset.repository?.name &&
      modset.repository.name !== existingSet.repository?.name
    ) {
      modset.name = `${modset.name} (${modset.repository.name})`;
    }
  }

  modsetMap.set(modset.name, modset);
  state.modsets = [...modsetMap.values()];

  setState(state);
}

/**
 * Update a modset
 *
 * Triggers a save
 *
 * @param modset - The configuration
 */
export function editModset(modset: Modset): void {
  const state = getState();

  const modsetMap = new Map(state.modsets.map((set) => [set.name, set]));

  // Check if already exists
  const existingSet = modsetMap.get(modset.name);
  if (!existingSet) {
    return;
  }
  // If new modset doesn't have a source and the found one have it, reject
  if (!modset.repository?.name && existingSet.repository?.name) {
    throw new Error(t('modsets.errors.readonly'));
  }
  // If new modset have a source but doesn't match, do nothing
  if (
    modset.repository.name &&
    modset.repository.name !== existingSet.repository?.name
  ) {
    return;
  }

  modsetMap.set(modset.name, modset);
  state.modsets = [...modsetMap.values()];

  setState(state);
}

/**
 * Delete a modset
 *
 * Triggers a save
 *
 * @param modset - The configuration
 */
export function removeModset(modset: Modset): void {
  const state = getState();

  state.modsets = state.modsets.filter(({ name }) => name !== modset.name);

  setState(state);
}
