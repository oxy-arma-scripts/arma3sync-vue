import type { GameServer } from '~/app/models/gameServers/types';

/**
 * Type of the state
 */
export type GameState = {
  isRunning: boolean;
};

/**
 * Type of the options to start game
 */
export type StartGameOptions = {
  gameServer?: GameServer;
};
