import { prepareMethod } from '~/app/lib/bridge';

import { openGameFolder, openGameFolderPicker } from './actions';

// Prepare methods for IPC
prepareMethod(openGameFolder);
prepareMethod(openGameFolderPicker);

export { loadSettings, getSettings } from './state';
