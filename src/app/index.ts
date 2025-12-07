import { setTimeout } from 'node:timers/promises';

import { setMainWindow, type BrowserWindow } from '~/app/lib/window';

import { setStep } from '~/app/models/loadingState';
import { loadSettings } from '~/app/models/settings';
import { loadMods } from '~/app/models/mods';
import { loadRepositories } from '~/app/models/repositories';
import { loadModsets } from '~/app/models/modsets';
// oxlint-disable-next-line no-unassigned-import
import '~/app/models/game/index';

async function loadApp(): Promise<void> {
  await setTimeout(1000);

  await loadSettings();
  setStep('settings', true);

  await loadRepositories();
  setStep('repositories', true);

  await loadMods();
  setStep('mods', true);

  await loadModsets();
  setStep('modsets', true);
}

export function init(browser: BrowserWindow): void {
  setMainWindow(browser);

  loadApp();
}
