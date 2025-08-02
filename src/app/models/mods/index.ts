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

import { getSettings, setSettings } from '~/app/models/settings';

import type { ModsState, Mod, ModSource } from './types';

const logger = mainLogger.scope('app.models.mods');
const activePath = join(app.getPath('userData'), 'active-mods.json');

const CDLCs = ['GM', 'VN', 'CSLA', 'WS', 'SPE', 'RF', 'EF'] as const;
const CDLCKeys = new Set<string>(CDLCs);
type CDLCKey = typeof CDLCs[number];

const state: ModsState = {
  list: {},
  active: [],
};

async function saveActiveMods() {
  await fsp.mkdir(dirname(activePath), { recursive: true });

  try {
    await fsp.writeFile(activePath, JSON.stringify(state.active, undefined, 2));
    logger.info('Active mods saved', { activePath });
  } catch (error) {
    logger.error('Failed to save active mods', { activePath, error });
    throw error;
  }
}

async function loadActiveMods() {
  if (!existsSync(activePath)) {
    await saveActiveMods();
    return;
  }

  try {
    const data = await fsp.readFile(activePath, 'utf8');
    state.active = JSON.parse(data);
  } catch (error) {
    logger.error('Failed to load settings', { activePath, error });
    throw error;
  }
}

const {
  get: getMods,
} = prepareBridge(
  'mods',
  logger,
  () => state,
  ({ active }) => {
    state.active = [...new Set(active)];
    saveActiveMods();
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
  if (existsSync(activePath)) {
    await loadActiveMods();
  }

  const settings = getSettings();
  const sources = [...settings.modDirs];
  const modList: Mod[] = [];

  if (settings.gamePath) {
    const cdlcSource: ModSource = {
      name: 'Creator DLCs',
      mandatory: true,
      path: settings.gamePath,
    };

    const workshopSource: ModSource = {
      name: 'Steam Workshop',
      mandatory: true,
      path: resolve(settings.gamePath, `../../workshop/content/${APP_ID}`),
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

  // Updating settings
  const settings = getSettings();
  const existingPaths = new Set(settings.modDirs.map((d) => d.path));
  setSettings({
    ...settings,
    modDirs: [
      ...settings.modDirs,
      ...sources.filter(({ path }) => !existingPaths.has(path)),
    ],
  });

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
  // Updating settings
  const settings = getSettings();
  setSettings({
    ...settings,
    modDirs: settings.modDirs.filter(({ path }) => path !== source.path),
  });

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
