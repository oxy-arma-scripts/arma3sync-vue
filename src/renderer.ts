import { createApp } from 'vue';

import vuetify from './plugins/vuetify';
import pinia from './plugins/pinia';

import App from './app.vue';

createApp(App)
  .use(vuetify)
  .use(pinia)
  .mount('#app');
