import { readdir, readFile } from 'node:fs/promises';
import type { Dirent } from 'node:fs';
import { join } from 'node:path';

import { mainLogger } from '~/app/lib/logger';
import { type ModMeta, parseModMeta } from '~/app/lib/a3/modmeta';

import type { Mod, ModSource, ModFeatures } from './types';

const logger = mainLogger.scope('app.models.mods');

/**
 * IDs of CDLCs
 */
const CDLCs = ['GM', 'VN', 'CSLA', 'WS', 'SPE', 'RF', 'EF'] as const;

/**
 * Type of IDs of CDLCs
 */
type CDLCKey = (typeof CDLCs)[number];

/**
 * Set of IDs of CDLCs
 */
const CDLCKeys = new Set<string>(CDLCs);

/**
 * Excepected content of a mod
 */
const EXPECTED_CONTENTS: Readonly<Record<ModFeatures, RegExp>> = {
  addons: /^addons?$/i,
  keys: /^keys?$/i,
  meta: /^meta\.cpp$/i,
  main: /^mod\.cpp$/i,
} as const;

/**
 * Is the current filesystem entry is a CDLC
 *
 * @param dir - The filesystem entry
 *
 * @returns If the current entry is a CDLC
 */
export function isCDLC(dir: Dirent<string>): dir is Dirent<CDLCKey> {
  return dir.isDirectory() && CDLCKeys.has(dir.name);
}

/**
 * Is the current filesystem entry is a Workshop mod
 *
 * @param dir - The filesystem entry
 *
 * @returns If the current entry is a Workshop mod
 */
export function isWorkshopMod(dir: Dirent<string>): dir is Dirent<string> {
  return dir.isDirectory();
}

/**
 * Is the current filesystem entry is a mod
 *
 * @param dir - The filesystem entry
 *
 * @returns If the current entry is a mod
 */
export function isMod(dir: Dirent<string>): dir is Dirent<`@${string}`> {
  return dir.isDirectory() && dir.name.startsWith('@');
}

/**
 * Get a Mod object from a filesystem entry
 *
 * @param source - The path of the mod source
 * @param dir - The filesystem entry
 *
 * @returns The corresponding Mod
 */
// oxlint-disable-next-line max-lines-per-function
async function getMod(
  source: string,
  dir: Dirent<string>
): Promise<Omit<Mod, 'source'> | null> {
  const modPath = join(source, dir.name);
  try {
    const contents = await readdir(modPath);

    const features = {} as Record<keyof typeof EXPECTED_CONTENTS, boolean>;
    for (const content of contents) {
      const entries = Object.entries(EXPECTED_CONTENTS) as [
        ModFeatures,
        RegExp,
      ][];

      for (const [key, value] of entries) {
        features[key] = features[key] || value.test(content);
      }
    }

    const seemsLikeAMod = Object.values(features).some((value) => !!value);
    if (!seemsLikeAMod) {
      return null;
    }

    let meta: ModMeta = {};
    if (features.meta) {
      meta = {
        ...meta,
        ...parseModMeta(await readFile(join(modPath, 'meta.cpp'), 'utf-8')),
      };
    }
    if (features.main) {
      meta = {
        ...meta,
        ...parseModMeta(await readFile(join(modPath, 'mod.cpp'), 'utf-8')),
      };
    }

    return {
      id: dir.name,
      subpath: dir.name,
      name: meta.name || dir.name,
      features,
    };
  } catch (err) {
    logger.error('Failed to load mod', { err });
    return null;
  }
}

/**
 * List CDLCs available for a given source
 *
 * @param source - The source of mods
 *
 * @returns The found CDLCs
 */
export async function listCDLCFromSource(source: ModSource): Promise<Mod[]> {
  const contents = await readdir(source.path, { withFileTypes: true });

  const mods: Mod[] = [];

  for (const folder of contents) {
    if (!isCDLC(folder)) {
      continue;
    }

    // oxlint-disable-next-line no-await-in-loop
    const mod = await getMod(source.path, folder);
    if (mod) {
      mods.push({ ...mod, source });
    }
  }

  return mods;
}

/**
 * List mods from workshop available for a given source
 *
 * @param source - The source of mods
 *
 * @returns The found mods
 */
export async function listWorkshopModsFromSource(
  source: ModSource
): Promise<Mod[]> {
  const contents = await readdir(source.path, { withFileTypes: true });

  const mods: Mod[] = [];

  for (const folder of contents) {
    if (!isWorkshopMod(folder)) {
      continue;
    }

    // oxlint-disable-next-line no-await-in-loop
    const mod = await getMod(source.path, folder);
    if (mod) {
      mods.push({ ...mod, source });
    }
  }

  return mods;
}

/**
 * List mods available for a given source
 *
 * @param source - The source of mods
 *
 * @returns The found mods
 */
export async function listModsFromSource(source: ModSource): Promise<Mod[]> {
  const contents = await readdir(source.path, { withFileTypes: true });
  const mods: Mod[] = [];

  for (const folder of contents) {
    if (!isMod(folder)) {
      // Try to find mods in subfolders
      if (folder.isDirectory()) {
        // oxlint-disable-next-line no-await-in-loop
        const subMods = await listModsFromSource({
          ...source,
          path: join(source.path, folder.name),
        });

        mods.push(
          ...subMods.map((mod) => ({
            ...mod,
            source,
            subpath: join(folder.name, mod.subpath),
          }))
        );
      }

      continue;
    }

    // oxlint-disable-next-line no-await-in-loop
    const mod = await getMod(source.path, folder);
    if (mod) {
      mods.push({ ...mod, source });
    }
  }

  return mods;
}
