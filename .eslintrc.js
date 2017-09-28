const glo = require('./build/config/provide')

module.exports = {
  root: true,
  parser: 'babel-eslint',
  env: {
    'browser': true,
    'node': true,
    'es6': true
  },
  parserOptions: {
    ecmaVersion: 6, // ?
    sourceType: "module"
  },
  extends: 'vue',
  plugins: [
    'vue',
    'html'
  ],
  globals: Object.assign({
    'window': true,
    'document': true,
    'localStoreage': true,
    '__dirname': true,
    'path': true,
    'Toast': true,
    'Axios': true,
    'Promise': true
  }, glo),
  rules: {
    'no-new': 0,
    'no-multiple-empty-lines': 0
  }
}
