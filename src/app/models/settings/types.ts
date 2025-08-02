import type { ModSource } from '../mods/types';

export type Settings = {
  gamePath: string;
  gameParams: Record<string, string | boolean>;

  modDirs: ModSource[];
};
