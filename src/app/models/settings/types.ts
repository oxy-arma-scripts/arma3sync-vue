export type Settings = {
  game: {
    path: string;
    params: Record<string, string | boolean>;
  };

  display: {
    theme: 'light' | 'dark' | 'auto';
    language: string | null;
  }
};
