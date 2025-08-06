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

/* eslint-disable no-underscore-dangle */
// @ts-ignore
const t: typeof i18n.__ = (...params) => i18n.__(...params);
// @ts-ignore
const n: typeof i18n.__n = (...params) => i18n.__n(...params);
// @ts-ignore
const mf: typeof i18n.__mf = (...params) => i18n.__mf(...params);
// @ts-ignore
const l: typeof i18n.__l = (...params) => i18n.__l(...params);
// @ts-ignore
const h: typeof i18n.__h = (...params) => i18n.__h(...params);
/* eslint-enable no-underscore-dangle */

export {
  i18n,
  t,
  n,
  mf,
  l,
  h,
};
