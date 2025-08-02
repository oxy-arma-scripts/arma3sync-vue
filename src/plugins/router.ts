import { createMemoryHistory, createRouter } from 'vue-router';

import HomePage from '../pages/home.vue';
import SettingsPage from '../pages/settings.vue';
import AboutPage from '../pages/about.vue';

const routes = [
  { path: '/', component: HomePage },
  { path: '/settings', component: SettingsPage },
  { path: '/about', component: AboutPage },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export default router;
