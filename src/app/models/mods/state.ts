import { resolve } from 'node:path';

import { createFileDB } from '~/app/lib/lowdb';
import { mainLogger } from '~/app/lib/logger';
import { prepareBridge } from '~/app/lib/bridge';
import { sendToRender } from '~/app/lib/window';
import { APP_ID } from '~/app/lib/a3';

import { getSettings } from '~/app/models/settings';

import type { ModsState, Mod, ModSource, ComputedModsState } from './types';

import {
  listCDLCFromSource,
  listWorkshopModsFromSource,
  listModsFromSource,
} from './utils';

const logger = mainLogger.scope('app.models.mods');

let globalModList: Record<string, Mod> = {};

/**
 * Current state
 */
const db = createFileDB<ModsState>('mods.json', {
  sources: [],
  active: [],
});
/**
 * Save state as file
 */
async function saveState(): Promise<void> {
  try {
    await db.write();
    logger.info('Mods saved', { dbPath: db.path });
  } catch (error) {
    logger.error('Failed to save mods', { dbPath: db.path, error });
    throw error;
  }
}

/**
 * Load state from file
 */
async function loadState(): Promise<void> {
  try {
    await db.read();
    sendToRender('bridge:mods', db.data);
  } catch (error) {
    logger.error('Failed to load mods', { dbPath: db.path, error });
    throw error;
  }
}

/**
 * Setup IPC bridge for state
 */
const { get: getState, set: setState } = prepareBridge<ComputedModsState>(
  'mods',
  logger,
  () => ({
    ...db.data,
    list: globalModList,
  }),
  ({ list: _l, ...value }) => {
    db.data = {
      ...value,
      active: [
        ...new Map(value.active.map((entry) => [entry.id, entry])).values(),
      ],
    };
    saveState();
  }
);

export { getState as getMods, setState as setMods };

/**
 * Load mods from sources and prepare them to be used
 *
 * Triggers a load
 */
// oxlint-disable-next-line max-lines-per-function
export async function loadMods(): Promise<void> {
  await loadState();

  const settings = getSettings();
  const sources = [...db.data.sources];
  const modList: Mod[] = [];

  if (settings.game.path) {
    const cdlcSource: ModSource = {
      name: '!cdlc',
      native: true,
      path: settings.game.path,
    };

    const workshopSource: ModSource = {
      name: '!workshop',
      native: true,
      path: resolve(settings.game.path, `../../workshop/content/${APP_ID}`),
    };

    // Load CDLCs
    try {
      const mods = await listCDLCFromSource(cdlcSource);
      modList.push(...mods);
    } catch (error) {
      logger.error('Failed to list cdlcs', { source: cdlcSource, error });
    }
    // Load Workshop mods
    try {
      const mods = await listWorkshopModsFromSource(workshopSource);
      modList.push(...mods);
    } catch (error) {
      logger.error('Failed to list workshop mods', {
        source: workshopSource,
        error,
      });
    }
  }

  for (const source of sources) {
    try {
      // oxlint-disable-next-line no-await-in-loop
      const mods = await listModsFromSource(source);
      modList.push(...mods);
    } catch (error) {
      logger.error('Failed to list mods from source', { source, error });
    }
  }

  globalModList = Object.fromEntries(
    modList.map((mod): [string, Mod] => [mod.id, mod])
  );

  logger.info('Mods loaded', { sources });
}

/**
 * Add multiple mod sources
 *
 * Triggers a save
 *
 * @param sources - The configuration of sources
 */
export async function addModSources(sources: ModSource[]): Promise<void> {
  const state = getState();

  // Updating sources
  state.sources = [
    ...new Map(
      [...state.sources, ...sources].map((source) => [source.path, source])
    ).values(),
  ];

  // Loading mods from new sources
  const modList: Mod[] = [];

  for (const source of sources) {
    try {
      // oxlint-disable-next-line no-await-in-loop
      const mods = await listModsFromSource(source);
      modList.push(...mods);
    } catch (error) {
      logger.error('Failed to list mods from source', { source, error });
    }
  }

  // Saving mod list
  globalModList = {
    ...globalModList,
    ...Object.fromEntries(modList.map((mod): [string, Mod] => [mod.id, mod])),
  };

  setState(state);
}

/**
 * Update a mod source
 *
 * Triggers a save
 *
 * @param source - The configuration
 */
export function editModSource(source: ModSource): void {
  const state = getState();

  const index = state.sources.findIndex(({ path }) => path === source.path);
  if (index < 0) {
    return;
  }

  state.sources[index] = {
    ...source,
    path: state.sources[index].path,
  };

  setState(state);
}

/**
 * Delete a mod source
 *
 * Triggers a save
 *
 * @param source - The configuration
 */
export function removeModSource(source: ModSource): void {
  const state = getState();

  // Updating sources
  state.sources = state.sources.filter(({ path }) => path !== source.path);

  // Saving mod list
  const modList = Object.entries(state.list).filter(
    ([, mod]) => mod.source.path !== source.path
  );

  globalModList = Object.fromEntries(modList);
  // Ensuring active mods exists
  state.active = state.active.filter(({ id }) =>
    modList.some(([, mod]) => mod.id === id)
  );

  setState(state);
}
