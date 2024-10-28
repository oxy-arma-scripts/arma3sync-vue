require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'plugin:import/electron',
    'plugin:import/typescript',
    'plugin:vue/vue3-essential',
    '@vue/eslint-config-airbnb-with-typescript',
  ],
  overrides: [
    {
      files: ['*.config.ts'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      files: ['src/stores/*.ts'],
      rules: {
        'import/prefer-default-export': 'off',
      },
    },
  ],
  parserOptions: {
    project: ['./tsconfig.eslint.json'],
  },
};
