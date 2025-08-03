export type SyncSource = {
  name: string,
  url: string,
  options?: {
    timeout?: number
  },
  destination: string,
};

export type SyncState = {
  sources: SyncSource[],
};
