import { getMods, setMods } from '~/app/models/mods/state';

import type { Modset } from './types';
// import { getModsets, setModsets } from './state';

/**
 * Set mods referenced in modset as active
 *
 * @param modset - The configuration
 */
export function applyModset(modset: Modset): void {
  const modsState = getMods();

  const modIds = new Set(modset.mods.map(({ id }) => id));
  const mods = Object.values(modsState.list).filter((mod) =>
    modIds.has(mod.id)
  );
  modsState.active = mods.map((mod) => ({ id: mod.id }));

  setMods(modsState);
}

/**
 * Set mods referenced in modset as inactive
 *
 * @param modset - The configuration
 */
export function unapplyModset(modset: Modset): void {
  const modsState = getMods();

  const modIds = new Set(modset.mods.map(({ id }) => id));
  modsState.active = modsState.active.filter((mod) => !modIds.has(mod.id));

  setMods(modsState);
}
