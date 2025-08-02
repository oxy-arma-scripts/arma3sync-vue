import { setTimeout } from 'node:timers/promises';

import { setMainWindow, type BrowserWindow } from '~/app/lib/window';

import { getLoadingState, setLoadingState } from '~/app/models/loadingState';
import { loadSettings } from '~/app/models/settings';
import { loadMods } from '~/app/models/mods';
import '~/app/models/game';

async function loadApp() {
  await setTimeout(1000);

  await loadSettings();
  setLoadingState({ ...getLoadingState(), settings: true });
import { setMainWindow, type BrowserWindow } from './lib/window';
import './models/counter';

}

// eslint-disable-next-line import/prefer-default-export
export function init(browser: BrowserWindow) {
  setMainWindow(browser);

  loadApp();
}
