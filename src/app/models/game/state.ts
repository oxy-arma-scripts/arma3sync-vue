import find from 'find-process';

import { mainLogger } from '~/app/lib/logger';
import { prepareBridge } from '~/app/lib/bridge';

import type { GameState } from './types';

const logger = mainLogger.scope('app.models.game');

/**
 * Current state
 */
let state: GameState = {
  isRunning: false,
};

/**
 * Setup IPC bridge for state
 */
const { get: getState, set: setState } = prepareBridge(
  'game',
  logger,
  () => state,
  (val) => {
    state = val;
  },
  { readonly: true }
);

export { getState as getGameState, setState as setGameState };

/**
 * Check if game is running and update state
 */
async function updateIsRunning(): Promise<void> {
  let { isRunning } = state;
  try {
    logger.debug('Checking if game is running');
    const list = await find('name', /Arma3(_x64)?\.exe/i);
    isRunning = list.length > 0;
  } catch (err) {
    logger.error('Failed to check if game is running', { err });
  }

  if (state.isRunning === isRunning) {
    return;
  }

  setState({
    ...getState(),
    isRunning,
  });
}

// Check every ~10s if game is running
// Using setTimeout to not block the main thread
// (and cause we don't need precision here)
async function watchGame(): Promise<void> {
  await updateIsRunning();
  setTimeout(watchGame, 10 * 1000);
}
watchGame();
