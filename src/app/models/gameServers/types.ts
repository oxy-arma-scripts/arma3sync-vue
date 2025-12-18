/**
 * Set of mods
 */
export type GameServer = {
  name: string;
  url: string;
  modset?: { name: string };
  repository?: { name: string };
};

/**
 * Type of the state
 */
export type GameServersState = {
  servers: GameServer[];
};
