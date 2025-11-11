import { mainLogger } from '~/app/lib/logger';
import { prepareBridge } from '~/app/lib/bridge';

import type { LoadingState } from './types';

const logger = mainLogger.scope('app.models.loading-state');

/**
 * Current state
 */
let loadingState: LoadingState = {
  settings: false,
  repositories: false,
  mods: false,
};

/**
 * Setup IPC bridge for state
 */
const { get: getLoadingState, set: setLoadingState } = prepareBridge(
  'loading-state',
  logger,
  () => loadingState,
  (value) => {
    loadingState = value;
  },
  { readonly: true }
);

export { getLoadingState, setLoadingState };
