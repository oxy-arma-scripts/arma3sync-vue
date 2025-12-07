export type ModFeatures = 'addons' | 'keys' | 'meta' | 'main';

/**
 * Source that contains mods in filesystem
 */
export type ModSource = {
  name: string;
  path: string;
  native?: true;
};

/**
 * Mod that can be added to game
 */
export type Mod = {
  id: string;
  subpath: string;
  name: string;
  source: ModSource;
  features: Record<ModFeatures, boolean>;
};

/**
 * Type of the state
 */
export type ModsState = {
  sources: ModSource[];
  active: { id: string }[];
};

/**
 * Type of the state with computed properties
 */
export type ComputedModsState = ModsState & {
  list: Record<string, Mod>;
};
