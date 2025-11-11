// oxlint-disable no-unassigned-import
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
// oxlint-enable no-unassigned-import

import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n';

import { useI18n } from 'vue-i18n';

import { i18n } from './i18n';

export const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  locale: {
    adapter: createVueI18nAdapter({ i18n, useI18n }),
  },
});
