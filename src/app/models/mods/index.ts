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
import { t } from '~/app/lib/i18n';
import { prepareBridge, prepareMethod } from '~/app/lib/bridge';
import { sendToRender, showOpenDialog } from '~/app/lib/window';
import { APP_ID } from '~/app/lib/a3';
import { type ModMeta, parseModMeta } from '~/app/lib/a3/modmeta';

import { getSettings } from '~/app/models/settings';

import type {
  ModsState,
  Mod,
  ModSource,
  ModFeatures,
} from './types';

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
  get: getState,
  set: setState,
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

const EXPECTED_CONTENTS: Readonly<Record<ModFeatures, RegExp>> = {
  addons: /^addons?$/i,
  keys: /^keys?$/i,
  meta: /^meta\.cpp$/i,
  main: /^mod\.cpp$/i,
} as const;

async function getMod(source: string, folder: Dirent<string>): Promise<Omit<Mod, 'source'> | null> {
  const modPath = join(source, folder.name);
  try {
    const contents = await fsp.readdir(modPath);

    const features = contents.reduce((acc, c) => {
      const entries = Object.entries(EXPECTED_CONTENTS) as [ModFeatures, RegExp][];

      // eslint-disable-next-line no-restricted-syntax
      for (const [key, value] of entries) {
        acc[key] = acc[key] || value.test(c);
      }
      return acc;
    }, {} as Record<keyof typeof EXPECTED_CONTENTS, boolean>);

    const seemsLikeAMod = Object.values(features).some((v) => v);
    if (!seemsLikeAMod) {
      return null;
    }

    let meta: ModMeta = {};
    if (features.meta) {
      meta = {
        ...meta,
        ...parseModMeta(await fsp.readFile(join(modPath, 'meta.cpp'), 'utf-8')),
      };
    }
    if (features.main) {
      meta = {
        ...meta,
        ...parseModMeta(await fsp.readFile(join(modPath, 'mod.cpp'), 'utf-8')),
      };
    }

    return {
      id: folder.name,
      subpath: folder.name,
      name: meta.name || folder.name,
      features,
    };
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
  for (const folder of contents) {
    if (!isCDLC(folder)) {
      // eslint-disable-next-line no-continue
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const mod = await getMod(source.path, folder);
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
  for (const folder of contents) {
    if (!isWorkshopMod(folder)) {
      // eslint-disable-next-line no-continue
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const mod = await getMod(source.path, folder);
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
  for (const folder of contents) {
    if (!isMod(folder)) {
      // Try to find mods in subfolders
      if (folder.isDirectory()) {
        // eslint-disable-next-line no-await-in-loop
        const subMods = await listModsFromSource({
          ...source,
          path: join(source.path, folder.name),
        });

        mods.push(...subMods.map((m) => ({
          ...m,
          source,
          subpath: join(folder.name, m.subpath),
        })));
      }

      // eslint-disable-next-line no-continue
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const mod = await getMod(source.path, folder);
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

async function addModSources(sources: ModSource[]) {
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

  // Not using setState cause we changed the list
  sendToRender('bridge:mods', state);
  await saveState();
}

prepareMethod(addModSources);

// eslint-disable-next-line prefer-arrow-callback
prepareMethod(async function openModSourcePicker() {
  const result = await showOpenDialog({
    title: t('mod-sources.folderPicker.title'),
    properties: ['openDirectory', 'dontAddToRecent'],
  });

  const sources = result.filePaths
    .filter((d) => !!d)
    .map((path) => ({
      path,
      name: basename(path),
    }));

  await addModSources(sources);

  return sources;
});

// eslint-disable-next-line prefer-arrow-callback
prepareMethod(async function editModSource(source: ModSource) {
  const index = state.sources.findIndex(({ path }) => path === source.path);
  if (index < 0) {
    return;
  }

  state.sources[index] = {
    ...source,
    path: state.sources[index].path,
  };

  setState(state);
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

  // Not using setState cause we changed the list
  sendToRender('bridge:mods', state);
  await saveState();
});

export {
  getState as getMods,
  loadMods,
};
