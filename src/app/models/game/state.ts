import find from 'find-process';

import { createMemoryDB } from '~/app/lib/lowdb';
import { mainLogger } from '~/app/lib/logger';
import { prepareBridge } from '~/app/lib/bridge';

import type { GameState } from './types';

const logger = mainLogger.scope('app.models.game');

/**
 * Current state
 */
const db = createMemoryDB<GameState>({
  isRunning: false,
});

/**
 * Setup IPC bridge for state
 */
const { get: getState, set: setState } = prepareBridge(
  'game',
  logger,
  () => db.data,
  (val) => {
    db.data = val;
    db.write();
  },
  { readonly: true }
);

export { getState as getGameState, setState as setGameState };

/**
 * Check if game is running and update state
 */
async function updateIsRunning(): Promise<void> {
  const state = getState();
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
    ...state,
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
