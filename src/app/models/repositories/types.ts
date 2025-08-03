export type Repository = {
  name: string,
  url: string,
  options?: {
    timeout?: number
  },
  destination: string,
};

export type RepositoriesState = {
  repositories: Repository[],
};
