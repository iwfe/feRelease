// const os = require('os')
const path = require('path')
const ip = require('ip').address()
const webpack = require('webpack')
const merge = require('webpack-merge')
// const HappyPack = require('happypack')
// const happThreadPool = HappyPack.ThreadPool({size: os.cpus().length}) // 指定线程池中的线程数量为处理器的核心数
const webpackConfig = require('./webpack.base')
const ManifestPlugin = require('./utils/manifest')
const HtmlwebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const WebpackNotifierPlugin = require('webpack-notifier')
const provide = require('./config/provide')
const utils = require('./utils')
const isProd = process.env.NODE_ENV === 'production'

const conf = merge(webpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: true })
  },
  devtool: false,
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    new webpack.ProvidePlugin(provide),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity
    }),
    new WebpackNotifierPlugin({
      title: 'Success',
      alwaysNotify: true,
      contentImage: path.join(__dirname, 'config/ok.jpg')
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new ManifestPlugin({
      versionFiles: [
        'vendor.css',
        'vendor.js',
        'app.css',
        'app.js'
      ],
      hashNum: 7
    }),
    new HtmlwebpackPlugin({
      title: '静态发版',
      staticUrl: `//${ip}:3002/`,
      siteUrl: `//${ip}:3001/`,
      dev: '"本地开发环境"',
      inject: true,
      template: './build/views/tpl.ejs',
      inject: 'body',
      chunks: ['vendor', 'app']
    }),
    new FriendlyErrorsPlugin()
  ]
})

module.exports = conf
