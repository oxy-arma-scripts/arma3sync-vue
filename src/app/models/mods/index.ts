import fsp from 'node:fs/promises';
import { existsSync, type Dirent } from 'node:fs';
import {
  basename,
  dirname,
  join,
  resolve,
} from 'node:path';

import { app, shell } from 'electron';

import mainLogger from '~/app/lib/logger';
import { prepareBridge, prepareMethod } from '~/app/lib/bridge';
import { sendToRender, showOpenDialog } from '~/app/lib/window';
import { APP_ID } from '~/app/lib/a3';
import { parseModMeta } from '~/app/lib/a3/modmeta';

import { getSettings } from '~/app/models/settings';

import type { ModsState, Mod, ModSource } from './types';

const logger = mainLogger.scope('app.models.mods');
const activePath = join(app.getPath('userData'), 'mods.json');

const CDLCs = ['GM', 'VN', 'CSLA', 'WS', 'SPE', 'RF', 'EF'] as const;
const CDLCKeys = new Set<string>(CDLCs);
type CDLCKey = typeof CDLCs[number];

let state: ModsState = {
  list: {},
  sources: [],
  active: [],
};

async function saveState() {
  await fsp.mkdir(dirname(activePath), { recursive: true });

  try {
    await fsp.writeFile(activePath, JSON.stringify({
      ...state,
      list: undefined,
    }, undefined, 2));
    logger.info('Mods saved', { activePath });
  } catch (error) {
    logger.error('Failed to save mods', { activePath, error });
    throw error;
  }
}

async function loadState() {
  if (!existsSync(activePath)) {
    await saveState();
    return;
  }

  try {
    const data = await fsp.readFile(activePath, 'utf8');
    state = {
      ...state,
      ...JSON.parse(data),
    };
    sendToRender('bridge:mods', state);
  } catch (error) {
    logger.error('Failed to load mods', { activePath, error });
    throw error;
  }
}

const {
  get: getMods,
} = prepareBridge(
  'mods',
  logger,
  () => state,
  ({ list: _, ...value }) => {
    state = {
      ...state,
      ...value,
      active: [...new Set(value.active)],
    };
    saveState();
  },
);

async function getMod(source: string, f: Dirent<string>): Promise<Omit<Mod, 'source'> | null> {
  try {
    const modPath = join(source, f.name);
    const metaPath = join(modPath, 'mod.cpp');
    if (!existsSync(metaPath)) {
      return null;
    }

    const meta = parseModMeta(await fsp.readFile(metaPath, 'utf-8'));

    return ({
      id: f.name,
      subpath: f.name,
      name: meta.name || f.name,
    });
  } catch (err) {
    logger.error('Failed to load mod', { err });
    return null;
  }
}

function isCDLC(f: Dirent<string>): f is Dirent<CDLCKey> {
  return f.isDirectory() && CDLCKeys.has(f.name);
}

async function listCDLCFromSource(source: ModSource): Promise<Mod[]> {
  const contents = await fsp.readdir(source.path, { withFileTypes: true });

  const mods: Mod[] = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const f of contents) {
    if (!isCDLC(f)) {
      // eslint-disable-next-line no-continue
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const mod = await getMod(source.path, f);
    if (mod) {
      mods.push({ ...mod, source });
    }
  }

  return mods;
}

function isWorkshopMod(f: Dirent<string>): f is Dirent<string> {
  return f.isDirectory();
}

async function listWorkshopModsFromSource(source: ModSource): Promise<Mod[]> {
  const contents = await fsp.readdir(source.path, { withFileTypes: true });

  const mods: Mod[] = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const f of contents) {
    if (!isWorkshopMod(f)) {
      // eslint-disable-next-line no-continue
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const mod = await getMod(source.path, f);
    if (mod) {
      mods.push({ ...mod, source });
    }
  }

  return mods;
}

function isMod(f: Dirent<string>): f is Dirent<`@${string}`> {
  return f.isDirectory() && f.name.startsWith('@');
}

async function listModsFromSource(source: ModSource): Promise<Mod[]> {
  const contents = await fsp.readdir(source.path, { withFileTypes: true });
  const mods: Mod[] = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const f of contents) {
    if (!isMod(f)) {
      // eslint-disable-next-line no-continue
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const mod = await getMod(source.path, f);
    if (mod) {
      mods.push({ ...mod, source });
    }
  }

  return mods;
}

async function loadMods() {
  await loadState();

  const settings = getSettings();
  const sources = [...state.sources];
  const modList: Mod[] = [];

  if (settings.game.path) {
    const cdlcSource: ModSource = {
      name: '!cdlc',
      mandatory: true,
      path: settings.game.path,
    };

    const workshopSource: ModSource = {
      name: '!workshop',
      mandatory: true,
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
      logger.error('Failed to list workshop mods', { source: workshopSource, error });
    }
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const source of sources) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const mods = await listModsFromSource(source);
      modList.push(...mods);
    } catch (error) {
      logger.error('Failed to list mods from source', { source, error });
    }
  }

  state.list = Object.fromEntries(modList.map((m): [string, Mod] => [m.id, m]));

  logger.info('Mods loaded', { sources });
}

prepareMethod((source: ModSource) => shell.openPath(source.path), 'openModSourceFolder');

// eslint-disable-next-line prefer-arrow-callback
prepareMethod(async function addModSource() {
  const result = await showOpenDialog({
    title: 'Select source folder(s)',
    properties: ['openDirectory', 'dontAddToRecent'],
  });

  const sources: ModSource[] = result.filePaths
    .filter((d) => !!d)
    .map((path) => ({
      path,
      name: basename(path),
    }));

  // Updating sources
  state.sources = [...new Map(
    [
      ...state.sources,
      ...sources,
    ].map((s) => [s.path, s]),
  ).values()];

  // Loading mods from new sources
  const modList: Mod[] = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const source of sources) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const mods = await listModsFromSource(source);
      modList.push(...mods);
    } catch (error) {
      logger.error('Failed to list mods from source', { source, error });
    }
  }

  // Saving mod list
  state.list = {
    ...state.list,
    ...Object.fromEntries(modList.map((m): [string, Mod] => [m.id, m])),
  };
  sendToRender('bridge:mods', state);

  return sources;
});

// eslint-disable-next-line prefer-arrow-callback
prepareMethod(async function removeModSource(source: ModSource) {
  // Updating sources
  state.sources = state.sources.filter(({ path }) => path !== source.path);

  // Saving mod list
  const modList = Object.entries(state.list).filter(([, m]) => m.source.path !== source.path);

  state.list = Object.fromEntries(modList);
  // Ensuring active mods exists
  state.active = state.active.filter((id) => modList.some(([, m]) => m.id === id));
  sendToRender('bridge:mods', state);
});

export {
  getMods,
  loadMods,
};
