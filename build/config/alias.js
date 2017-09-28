const path = require('path')

module.exports = {
  'vue': 'vue/dist/vue.runtime.min.js',
  'vue-router': 'vue-router/dist/vue-router.min.js',
  'toast': path.join(__dirname, '../../src/common/toast'),
  '@': path.join(__dirname, '../../src/components')
}
