import { createMemoryDB } from '~/app/lib/lowdb';
import { mainLogger } from '~/app/lib/logger';
import { prepareBridge } from '~/app/lib/bridge';

import type { LoadingState } from './types';

const logger = mainLogger.scope('app.models.loading-state');

/**
 * Current state
 */
const db = createMemoryDB<LoadingState>({
  settings: false,
  repositories: false,
  mods: false,
  modsets: false,
  gameServers: false,
});

/**
 * Setup IPC bridge for state
 */
const { get: getLoadingState, set: setLoadingState } = prepareBridge(
  'loading-state',
  logger,
  () => db.data,
  (value) => {
    db.data = value;
    db.write();
  },
  { readonly: true }
);

export { getLoadingState, setLoadingState };
