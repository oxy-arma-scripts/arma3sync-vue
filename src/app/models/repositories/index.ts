import { shell } from 'electron';

import { prepareMethod } from '~/app/lib/bridge';

import type { Repository } from './types';
import {
  importRepository,
  checkRepository,
  addRepository,
  editRepository,
  removeRepository,
  fetchRepository,
} from './methods';

prepareMethod((repository: Repository) => shell.openPath(repository.destination), 'openRepositoryFolder');

prepareMethod(importRepository);
prepareMethod(checkRepository);
prepareMethod(addRepository);
prepareMethod(editRepository);
prepareMethod(removeRepository);
prepareMethod(fetchRepository);

// eslint-disable-next-line import/prefer-default-export
export { loadRepositories } from './methods';
