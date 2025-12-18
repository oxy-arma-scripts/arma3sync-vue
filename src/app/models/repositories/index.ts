import { shell } from 'electron';

import { prepareMethod } from '~/app/lib/bridge';

import type { Repository } from './types';

import { addRepository, editRepository, removeRepository } from './state';

import {
  importRepository,
  checkRepositoryInfo,
  fetchRepositoryDiff,
  syncRepositoryDiff,
  fetchRepositoryModsets,
  fetchRepositoryGameServers,
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
prepareMethod(checkRepositoryInfo);
prepareMethod(fetchRepositoryDiff);
prepareMethod(syncRepositoryDiff);
prepareMethod(fetchRepositoryModsets);
prepareMethod(fetchRepositoryGameServers);

export { loadRepositories, getRepositories } from './state';
