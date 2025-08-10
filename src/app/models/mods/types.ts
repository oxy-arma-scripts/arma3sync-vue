export type ModFeatures = 'addons'
| 'keys'
| 'meta'
| 'main';

export type Mod = {
  id: string;
  subpath: string;
  name: string;
  source: ModSource;
  features: Record<ModFeatures, boolean>;
};

export type ModSource = {
  name: string;
  path: string;
  native?: true;
};

export type ModsState = {
  list: Record<string, Mod>;
  sources: ModSource[];
  active: string[];
};
