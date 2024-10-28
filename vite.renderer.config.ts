import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import autoImport from 'unplugin-auto-import/vite';
import components from 'unplugin-vue-components/vite';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
    autoImport({
      imports: ['vue', '@vueuse/core'],
      dirs: ['src/composables', 'src/utils', 'src/stores'],
      dts: '.vite/auto-imports.d.ts',
    }),
    components({
      directoryAsNamespace: true,
      dts: '.vite/components.d.ts',
    }),
  ],
});
