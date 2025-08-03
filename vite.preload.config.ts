import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: [
      { find: '~', replacement: resolve(__dirname, 'src') },
    ],
  },

  server: {
    watch: {
      ignored: [resolve(__dirname, 'data/**')],
    },
  },
});
