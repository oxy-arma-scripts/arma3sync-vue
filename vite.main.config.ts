import { resolve } from 'node:path';

import { defineConfig } from 'vite';
import yaml from '@modyfi/vite-plugin-yaml';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    yaml(),
  ],

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
