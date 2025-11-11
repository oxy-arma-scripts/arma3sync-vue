import find from 'find-process';

import { resolve } from 'node:path';

import { mainLogger } from '~/app/lib/logger';
import { prepareBridge, prepareMethod } from '~/app/lib/bridge';

import { getSettings } from '~/app/models/settings';
import { getMods } from '~/app/models/mods';

// import { isLinux } from '~/app/lib/platforms/linux';
import type { GameState } from './types';
import { launchGame } from './launch';

const logger = mainLogger.scope('app.models.game');

let state: GameState = {
  isRunning: false,
};

const { get: getGameState, set: setGameState } = prepareBridge(
  'game',
  logger,
  () => state,
  (val) => {
    state = val;
  },
  { readonly: true }
);

// oxlint-disable-next-line max-lines-per-function
prepareMethod(function startGame(): void {
  const settings = getSettings();

  // Default params
  // We're using -noLauncher to disable the launcher, since we don't need it
  const params: string[] = ['-noLauncher'];

  // Set params from settings
  // https://community.bistudio.com/wiki/Arma_3:_Startup_Parameters

  for (const [key, value] of Object.entries(settings.game.params)) {
    if (!value) {
      continue;
    }

    if (value === true) {
      params.push(`-${key}`);

      continue;
    }

    const valueInt = Number.parseInt(value, 10);
    if (Number.isNaN(valueInt)) {
      params.push(`-${key}="${value}"`);
    } else {
      params.push(`-${key}=${value}`);
    }
  }

  // Resolving active mods
  const { list, active } = getMods();
  const activeMods = active
    .map((id): string => {
      const mod = list[id];
      if (!mod) {
        return '';
      }
      return resolve(mod.source.path, mod.subpath);
    })
    .filter((mod) => !!mod);

  try {
    setGameState({
      ...getGameState(),
      isRunning: true,
    });

    // Launch game
    const { cmd, args, process } = launchGame(params, activeMods);
    logger.debug('Starting game...', { cmd, args });

    // Add logs on spawned process
    process.on('close', (code) => {
      logger.info('Game started', { code });
      // steam exits with 0 when it successfully started the game
      if (code !== 0) {
        setGameState({
          ...getGameState(),
          isRunning: false,
        });
      }
    });
    process.on('error', (err) => {
      logger.error('Failed to launch game', { err });
      setGameState({
        ...getGameState(),
        isRunning: false,
      });
    });
  } catch (err) {
    logger.error('Error while launching game', { err });
  }
});

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

  setGameState({
    ...getGameState(),
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

export { getGameState };
