import { prepareMethod } from '~/app/lib/bridge';

import { addGameServer, editGameServer, removeGameServer } from './state';

// Prepare methods for IPC
prepareMethod(addGameServer);
prepareMethod(editGameServer);
prepareMethod(removeGameServer);

export { loadGameServers, getGameServers } from './state';
