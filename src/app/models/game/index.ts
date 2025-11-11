import { prepareMethod } from '~/app/lib/bridge';

import { startGame } from './actions';

// Prepare methods for IPC
prepareMethod(startGame);

export { getGameState } from './state';
