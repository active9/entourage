module.exports = {
  env: {
    node: true,
    es6: true
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2017
  },
  extends: 'eslint:recommended',
  rules: {
    indent: ['warn', 2],
    'linebreak-style': ['warn', 'windows'],
    quotes: ['warn', 'single'],
    semi: ['warn', 'always'],
    'no-console': ['off']
  }
};
