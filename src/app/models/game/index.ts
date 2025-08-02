import find from 'find-process';

import { resolve } from 'node:path';

import mainLogger from '~/app/lib/logger';
import { prepareBridge, prepareMethod } from '~/app/lib/bridge';

import { getSettings } from '~/app/models/settings';
import { getMods } from '~/app/models/mods';

import { isLinux } from '~/app/lib/platforms/linux';
import type { GameState } from './types';
import launchGame from './launch';

const logger = mainLogger.scope('app.models.game');

let state: GameState = {
  isRunning: false,
};

const {
  get: getGameState,
  set: setGameState,
} = prepareBridge(
  'game',
  logger,
  () => state,
  (v) => { state = v; },
  { readonly: true },
);

// eslint-disable-next-line prefer-arrow-callback
prepareMethod(async function startGame() {
  const settings = getSettings();

  // Default params
  // We're using -noLauncher to disable the launcher, since we don't need it
  const params: string[] = ['-noLauncher'];

  // Set params from settings
  // https://community.bistudio.com/wiki/Arma_3:_Startup_Parameters
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(settings.gameParams)) {
    if (!value) {
      // eslint-disable-next-line no-continue
      continue;
    }

    if (value === true) {
      params.push(`-${key}`);
      // eslint-disable-next-line no-continue
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
  const activeMods = active.map((id) => {
    const mod = list[id];
    if (!mod) { return undefined; }
    return resolve(mod.source.path, mod.id);
  }).filter((m) => !!m);

  try {
    setGameState({
      ...getGameState(),
      isRunning: true,
    });

    // Launch game
    const { cmd, args, process } = await launchGame(params, activeMods);
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

async function updateIsRunning() {
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
(function watchGame() {
  updateIsRunning().then(() => {
    setTimeout(watchGame, 10 * 1000);
  });
}());

export {
  getGameState,
};
