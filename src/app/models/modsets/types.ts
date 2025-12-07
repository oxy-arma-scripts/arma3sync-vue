/**
 * Set of mods
 */
export type Modset = {
  name: string;
  description: string;
  mods: { id: string }[];
  repository?: { name: string };
};

/**
 * Type of the state
 */
export type ModsetsState = {
  modsets: Modset[];
};
