/**
 * Repository configuration
 */
export type Repository = {
  name: string,
  url: string,
  options?: {
    timeout?: number
  },
  destination: string,
};

/**
 * Action needed to make a file synced
 */
export type RepositorySyncItem = {
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'UNCHANGED',
  path: string,
  size: number,
  mod: {
    name: string,
    path: string,
  }
};

/**
 * Status of the queue that checks actions needed
 */
export type FetchQueueStatus = {
  active: boolean,
  done: number,
  total: number,
};

/**
 * Status of the queue that make repository synced
 */
export type SyncQueueStatus = {
  active: boolean,
  done: number,
  total: number,
};

/**
 * Type of the state
 */
export type RepositoriesState = {
  repositories: Repository[],
  checkStatus: Record<string, FetchQueueStatus>
  syncStatus: Record<string, SyncQueueStatus>
};
