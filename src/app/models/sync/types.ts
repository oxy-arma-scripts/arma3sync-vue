export type SyncSource = {
  url: string,
  options?: {
    timeout?: number
  }
};

export type SyncState = {
  sources: SyncSource[],
};
