export type ModFeatures = 'addons' | 'keys' | 'meta' | 'main';

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
 * Source that contains mods in filesystem
 */
export type ModSource = {
  name: string;
  path: string;
  native?: true;
};

/**
 * Type of the state
 */
export type ModsState = {
  list: Record<string, Mod>;
  sources: ModSource[];
  active: string[];
};
