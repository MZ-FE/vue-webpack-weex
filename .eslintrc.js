module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  extends: ['plugin:vue/essential', 'eslint:recommended', 'prettier'],
  plugins: ['vue', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
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
    APPTYPE_NAME: 'readonly',
    PLUGIN_VERSION: 'readonly',
    PAGE_NAME: 'readonly',
    PLUGIN_VERSION: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2019,
  },
}
