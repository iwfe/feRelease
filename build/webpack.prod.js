const os = require('os')
const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlwebpackPlugin = require('html-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ManifestPlugin = require('./utils/manifest')
const ZipWebpackPlugin = require('zip-webpack-plugin')
const OptimizeJsPlugin = require('optimize-js-plugin')
const UglifyJsParallelPlugin = require('webpack-uglify-parallel') // 多核
const webpackConfig = require('./webpack.base')
const pkg = require('../package.json')
const provide = require('./config/provide')
const utils = require('./utils')

const conf = merge(webpackConfig, {
  module: {
    rules: utils.styleLoaders({ extract: true })
  },
  devtool: false,
  plugins: [
    new ProgressBarPlugin(),
    new webpack.ProvidePlugin(provide),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_debugger: true,
        drop_console: true
      },
      output: {
        comments: false
      },
      sourceMap: false
    }),
    // new UglifyJsParallelPlugin({
    //   workers: os.cpus().length,
    //   output: {
    //     comments: false,
    //   },
    //   compress: {
    //     warnings: false,
    //   },
    //   sourceMap: false
    // }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity
    }),
    new ExtractTextPlugin({
      filename: '[name].css'
    }),
    new HtmlwebpackPlugin({
      dev: '"预发布环境"',
      title: '公用组件',
      template: './build/views/tpl.ejs',
      inject: 'body',
      chunks: ['vendor', 'app']
    }),
    new ManifestPlugin({
      versionFiles: [
        'vendor.css',
        'vendor.js',
        'app.css',
        'app.js'
      ],
      hashNum: 7
    }),
    new OptimizeJsPlugin({ sourceMap: false }),
    new webpack.optimize.ModuleConcatenationPlugin(), // https://github.com/lishengzxc/bblog/issues/34
    new ZipWebpackPlugin({
      path: '../zip',
      filename: `${pkg.name}.zip`,
      exclude: [/\.html$/]
    })
  ]
})

module.exports = conf
