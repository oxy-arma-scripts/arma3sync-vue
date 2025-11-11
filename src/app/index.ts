import { setTimeout } from 'node:timers/promises';

import { setMainWindow, type BrowserWindow } from '~/app/lib/window';

import { setStep } from '~/app/models/loadingState';
import { loadSettings } from '~/app/models/settings';
import { loadMods } from '~/app/models/mods';
import { loadRepositories } from '~/app/models/repositories';
// oxlint-disable-next-line no-unassigned-import
import '~/app/models/game/index-old';

async function loadApp(): Promise<void> {
  await setTimeout(1000);

  await loadSettings();
  setStep('settings', true);

  await loadRepositories();
  setStep('repositories', true);

  await loadMods();
  setStep('mods', true);
}

export function init(browser: BrowserWindow): void {
  setMainWindow(browser);

  loadApp();
}
