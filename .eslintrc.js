module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  extends: ['plugin:vue/essential', 'eslint:recommended', 'prettier'],
  plugins: ['vue', 'prettier'],
  rules: {
    'no-undef': 0,
    'no-empty': 0,
    'no-useless-escape': 0,
    'prettier/prettier': 'error',
    'space-before-function-paren': 0,
    'comma-dangle': 0,
    'vue/multi-word-component-names': [
      'error',
      {
        ignores: ['index'],
      },
    ],
    // 强制使用单引号
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
  },
  globals: {
    Vue: true,
    weex: true,
  },
  parserOptions: {
    ecmaVersion: 2019,
  },
}
