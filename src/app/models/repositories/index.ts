import { shell } from 'electron';

import { prepareMethod } from '~/app/lib/bridge';

import type { Repository } from './types';

import { addRepository, editRepository, removeRepository } from './state';

import {
  importRepository,
  checkRepository,
  fetchRepository,
  syncRepository,
  fetchRepositoryModsets,
} from './actions';

// Prepare methods for IPC
prepareMethod(
  (repository: Repository) => shell.openPath(repository.destination),
  'openRepositoryFolder'
);

prepareMethod(addRepository);
prepareMethod(editRepository);
prepareMethod(removeRepository);

prepareMethod(importRepository);
prepareMethod(checkRepository);
prepareMethod(fetchRepository);
prepareMethod(syncRepository);
prepareMethod(fetchRepositoryModsets);

export { loadRepositories, getRepositories } from './state';
