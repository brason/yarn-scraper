const path = require('path');

module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    // 'plugin:react/recommended',
    'plugin:prettier/recommended',
    // 'prettier/react',
    // 'plugin:jest/recommended',
    // 'plugin:sonarjs/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2019, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  settings: {
    // react: {
    //   version: '16.8.2',
    // },
    // 'import/resolver': {
    //   webpack: {
    //     config: 'webpack.config.js',
    //   },
    // },
  },
  // parserOptions: {
  //   sourceType: 'module',
  // },
  plugins: [
    // 'graphql',
    // 'react',
    // 'react-hooks',
    // 'moment-utc',
    'prettier',
    // 'jest',
    // 'sonarjs',
  ],
  env: {
    browser: true,
    es6: true,
    // jest: true,
  },
  'rules': {
    'prettier/prettier': [
      'error',
      {
        "arrowParens": "always",
        "trailingComma": "all",
        "singleQuote": true,
      }
    ],
    '@typescript-eslint/consistent-type-assertions': 'off',
    '@typescript-eslint/no-extra-parens': 'off',
    // TODO: Redo these rules based on the currently extended ruleset
    'react/display-name': 'off',
    'react/forbid-prop-types': [0, { forbid: ['any'] }],
    'react/prefer-stateless-function': [0, { ignorePureComponents: true }],
    'react/destructuring-assignment': 'off',
    // 'react-hooks/rules-of-hooks': 'error',
    // 'react-hooks/exhaustive-deps': 'error',
    // 'jest/valid-expect-in-promise': 'error',
    // 'jest/valid-expect': 0, // Because it will trigger in Cypress tests.
    // 'moment-utc/no-moment-without-utc': 2,
  },
  // 'overrides': [
  //   {
  //     'files': ['*.test.ts', '*.spec.ts'],
  //     'rules': {
  //       'no-unused-expressions': 0,
  //     },
  //   },
  // ],
};
