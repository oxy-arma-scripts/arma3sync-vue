import { resolve } from 'node:path';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import i18n from '@intlify/unplugin-vue-i18n/vite';
import vuetify from 'vite-plugin-vuetify';
import autoImport from 'unplugin-auto-import/vite';
import components from 'unplugin-vue-components/vite';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    vue(),
    i18n({
      include: [resolve(__dirname, './src/locales/**')],
    }),
    vuetify({ autoImport: true }),
    autoImport({
      imports: ['vue', '@vueuse/core', 'pinia', 'vue-i18n'],
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

  server: {
    watch: {
      ignored: [resolve(__dirname, 'data/**')],
    },
  },
});
