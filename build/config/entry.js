const path = require('path')
const url = path.join(__dirname, '../../src/app.js')

module.exports = {
  app: [url],
  vendor: [
    'vue',
    'vue-router',
    'axios',
    'toast',
    'fastclick',
    './src/common/iconfont/iconfont.css',
    './src/common/reset.css',
    './src/common/common.css',
    './src/common/media.css',
    './src/common/animate.css'
  ]
}
