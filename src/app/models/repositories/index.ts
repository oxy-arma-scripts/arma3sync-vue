import { shell } from 'electron';

import { prepareMethod } from '~/app/lib/bridge';

import type { Repository } from './types';

import {
  importRepository,
  checkRepository,
  fetchRepository,
  syncRepository,
} from './actions';
import {
  addRepository,
  editRepository,
  removeRepository,
} from './state';

// Prepare methods for IPC
prepareMethod((repository: Repository) => shell.openPath(repository.destination), 'openRepositoryFolder');
prepareMethod(importRepository);
prepareMethod(checkRepository);
prepareMethod(addRepository);
prepareMethod(editRepository);
prepareMethod(removeRepository);
prepareMethod(fetchRepository);
prepareMethod(syncRepository);

// eslint-disable-next-line import/prefer-default-export
export { loadRepositories } from './state';
