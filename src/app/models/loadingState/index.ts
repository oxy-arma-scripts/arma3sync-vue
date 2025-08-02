import mainLogger from '~/app/lib/logger';
import { prepareBridge } from '~/app/lib/bridge';

import type { LoadingState } from './types';

const logger = mainLogger.scope('app.models.loading-state');

let loadingState: LoadingState = {
  settings: false,
  mods: false,
};

const {
  get: getLoadingState,
  set: setLoadingState,
} = prepareBridge(
  'loading-state',
  logger,
  () => loadingState,
  (v) => { loadingState = v; },
  { readonly: true },
);

export {
  getLoadingState,
  setLoadingState,
};
