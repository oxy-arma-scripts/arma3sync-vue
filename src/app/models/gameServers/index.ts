import { prepareMethod } from '~/app/lib/bridge';

import { addModset, editModset, removeModset } from './state';
import { applyModset, unapplyModset } from './actions';

// Prepare methods for IPC
prepareMethod(addModset);
prepareMethod(editModset);
prepareMethod(removeModset);

prepareMethod(applyModset);
prepareMethod(unapplyModset);

export { loadGameServers, getGameServers } from './state';
