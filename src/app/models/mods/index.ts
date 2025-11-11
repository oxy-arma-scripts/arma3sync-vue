import { shell } from 'electron';

import { prepareMethod } from '~/app/lib/bridge';

import type { ModSource } from './types';

import { addModSources, editModSource, removeModSource } from './state';

import { openModSourcePicker } from './actions';

prepareMethod(
  (source: ModSource) => shell.openPath(source.path),
  'openModSourceFolder'
);

prepareMethod(addModSources);
prepareMethod(editModSource);
prepareMethod(removeModSource);

prepareMethod(openModSourcePicker);

export { loadMods, getMods } from './state';
