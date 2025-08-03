import { createApp } from 'vue';

import vuetify from '~/plugins/vuetify';
import i18n from '~/plugins/i18n';
import pinia from '~/plugins/pinia';
import router from '~/plugins/router';

import App from '~/app.vue';

createApp(App)
  .use(vuetify)
  .use(i18n)
  .use(pinia)
  .use(router)
  .mount('#app');
