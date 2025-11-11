import { setTimeout } from 'node:timers/promises';

import { setMainWindow, type BrowserWindow } from '~/app/lib/window';

import { getLoadingState, setLoadingState } from '~/app/models/loadingState';
import { loadSettings } from '~/app/models/settings';
import { loadMods } from '~/app/models/mods';
import { loadRepositories } from '~/app/models/repositories';
// oxlint-disable-next-line no-unassigned-import
import '~/app/models/game';

async function loadApp(): Promise<void> {
  await setTimeout(1000);

  await loadSettings();
  setLoadingState({ ...getLoadingState(), settings: true });

  await loadRepositories();
  setLoadingState({ ...getLoadingState(), repositories: true });

  await loadMods();
  setLoadingState({ ...getLoadingState(), mods: true });
}

export function init(browser: BrowserWindow): void {
  setMainWindow(browser);

  loadApp();
}
