if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse('"development"')
}
const ip = require('ip')
const opn = require('opn')
const address = ip.address()
const fs = require('fs-extra')
const port = process.env.PORT || 3002
const webpack = require('webpack')
const express = require('express')
const conf = require('./webpack.dev')
const webpackDevMiddleware = require('webpack-dev-middleware')
const app = express()
conf.plugins.splice(4, 1) // 移除热更新
fs.removeSync('./dist')
fs.removeSync('./zip')

const compiler = webpack(conf)
const devMiddleware = webpackDevMiddleware(compiler, {
  publicPath: compiler.options.output.publicPath,
  noInfo: true,
  quiet: true,
  stats: {
    colors: true,
    hash: false,
    version: false,
    timings: false,
    assets: false,
    chunks: false,
    children: false
  }
})

app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')
app.engine('.html', require('ejs').renderFile)
app.use(devMiddleware)

devMiddleware.waitUntilValid(() => {
  opn(`http://${address}:${port}`)
})

app.listen(port)
