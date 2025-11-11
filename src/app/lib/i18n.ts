import { I18n } from 'i18n';

import en from '../locales/en.yaml';
import fr from '../locales/fr.yaml';

const i18n = new I18n({
  staticCatalog: {
    en,
    fr,
  },

  objectNotation: true,

  defaultLocale: 'en',
  retryInDefaultLocale: true,
});

/* oxlint-disable id-length */
// @ts-expect-error - Issues with types of params
const t: typeof i18n.__ = (...params) => i18n.__(...params);
// @ts-expect-error - Issues with types of params
const n: typeof i18n.__n = (...params) => i18n.__n(...params);
const mf: typeof i18n.__mf = (...params) => i18n.__mf(...params);
const l: typeof i18n.__l = (...params) => i18n.__l(...params);
const h: typeof i18n.__h = (...params) => i18n.__h(...params);
/* oxlint-enable id-length */

export { i18n, t, n, mf, l, h };
