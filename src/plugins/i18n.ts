import { createI18n } from 'vue-i18n';
import * as vuetifyLocales from 'vuetify/locale';

import messages from '@intlify/unplugin-vue-i18n/messages';

export default createI18n({
  fallbackLocale: 'en',
  messages: Object.fromEntries(
    Object.keys(messages).map((locale) => [locale, {
      ...messages[locale],
      $vuetify: (vuetifyLocales as Record<string, unknown>)[locale],
    }]),
  ),
});
