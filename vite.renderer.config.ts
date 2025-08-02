import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import autoImport from 'unplugin-auto-import/vite';
import components from 'unplugin-vue-components/vite';
import { resolve } from 'node:path';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
    autoImport({
      imports: ['vue', '@vueuse/core', 'pinia'],
      dirs: ['src/composables', 'src/utils', 'src/stores'],
      dts: '.vite/auto-imports.d.ts',
    }),
    components({
      directoryAsNamespace: true,
      dts: '.vite/components.d.ts',
    }),
  ],

  resolve: {
    alias: [
      { find: '~', replacement: resolve(__dirname, 'src') },
    ],
  },
});
