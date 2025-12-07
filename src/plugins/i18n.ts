import { createI18n } from 'vue-i18n';
import { fr, en } from 'vuetify/locale';

import messages from '@intlify/unplugin-vue-i18n/messages';

const vuetifyLocales: Record<string, unknown> = {
  fr,
  en,
};

export const i18n = createI18n({
  fallbackLocale: 'en',
  messages: Object.fromEntries(
    Object.keys(messages).map((locale) => [
      locale,
      {
        ...messages[locale],
        $vuetify: vuetifyLocales[locale],
      },
    ])
  ),
});
