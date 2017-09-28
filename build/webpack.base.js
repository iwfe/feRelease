const path = require('path')
const output = require('./config/output')
const alias = require('./config/alias')
const entry = require('./config/entry')
const vueLoaderConfig = require('./config/vue-loader')
const resolve = (dir) => path.join(__dirname, '..', dir)

const conf = {
  cache: true,
  entry,
  output,
  resolve: {
    extensions: ['.vue', '.js', '.json'],
    modules: [
      resolve('src'),
      resolve('node_modules')
    ],
    alias
  },
  module: {
    noParse: [/vue\.runtime\.min/, /vue-router\.min/], // 跳过对其的解析来进行优化
    rules: [
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [resolve('src')],
        exclude: /node_modules/,
        options: {
          formatter: require('eslint-friendly-formatter')
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        // loader: ['babel-loader?cacheDirectory=true'],
        loader: 'babel-loader',
        exclude: /node_modules/,
        include: [resolve('src')]
      },
      {
        test: /\.(png|jpe?g|gif|svg|swf|woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        query: {
          limit: 10000,
          name: '[name].[hash:7].[ext]'
        }
      }
    ]
  }
}

module.exports = conf
