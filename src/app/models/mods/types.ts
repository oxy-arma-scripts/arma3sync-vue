export type Mod = {
  id: string;
  subpath: string;
  name: string;
  source: ModSource;
};

export type ModSource = {
  name: string;
  path: string;
  mandatory?: true;
};

export type ModsState = {
  list: Record<string, Mod>;
  sources: ModSource[];
  active: string[];
};
