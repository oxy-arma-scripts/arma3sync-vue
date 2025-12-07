import { resolve } from 'node:path';

import { mainLogger } from '~/app/lib/logger';

import { getSettings } from '~/app/models/settings';
import { getMods } from '~/app/models/mods';

// import { isLinux } from '~/app/lib/platforms/linux';
import { launchGame } from './launch';

import { setGameState, getGameState } from './state';

const logger = mainLogger.scope('app.models.game');

// oxlint-disable-next-line max-lines-per-function
export function startGame(): void {
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
    .map(({ id }): string => {
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
}
