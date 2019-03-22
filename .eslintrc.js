module.exports = {
    'rules': {
      'indent': [
        'error',
        2,
        { 'SwitchCase': 1 }
      ],
      'quotes': [
        2,
        'single',
        { 'allowTemplateLiterals': true }
      ],
      'linebreak-style': [
        2,
        'unix'
      ],
      'semi': [
        2,
        'always'
      ],
      'no-console': 'off',
      'react/jsx-uses-vars': ['error'],
      'space-infix-ops': ['error', {'int32Hint': true}],
      "react/prop-types": 0
    },
    'env': {
      'es6': true,
      'node': true,
      'browser': true
    },
    'extends': [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:import/errors',
    ],
    'parser': 'babel-eslint',
    'parserOptions': {
      'ecmaVersion': 6,
      'ecmaFeatures': {
        'jsx': true,
        'experimentalObjectRestSpread': true
      },
      'sourceType': 'module'
    },
    "settings": {
      "react": {
        "version": "detect", 
      }
    },
    'plugins': ['react']
  };