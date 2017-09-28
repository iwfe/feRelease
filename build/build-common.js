const webpack = require('webpack')

const webpackTask = function (webpackConf, callback) {
  webpack(webpackConf, (err, stats) => {
    if (err) {
      throw err
    }
    process.stdout.write(stats.toString({
      colors: true,
      hash: false,
      version: true,
      timings: true,
      assets: true,
      chunks: false,
      children: false
    }) + '\n\n')
    if (callback && typeof callback === 'function') callback()
  })
}

module.exports = webpackTask
