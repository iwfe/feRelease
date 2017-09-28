if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse('"development"')
}
const ip = require('ip')
const opn = require('opn')
const address = ip.address()
const fs = require('fs-extra')
const chalk = require('chalk')
const port = process.env.PORT || 3002
const webpack = require('webpack')
const express = require('express')
const conf = require('./webpack.dev')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const app = express()

conf.entry.app.unshift('webpack-hot-middleware/client')
conf.output.publicPath = `//${address}:${port}/`

fs.emptyDirSync('./dist')
fs.emptyDirSync('./zip')

const compiler = webpack(conf)
const hotMiddleware = webpackHotMiddleware(compiler, {
  log: () => {},
  path: '/__webpack_hmr'
})
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

app.use(devMiddleware)
app.use(hotMiddleware)

let _resolve = null
const readyPromise = new Promise(resolve => {
  _resolve = resolve
})

devMiddleware.waitUntilValid(() => {
  opn(`http://${address}:${port}`)
  console.log(chalk.yellow('dev %s'), `http://${address}:${port}\n`)
  _resolve()
})

const server = app.listen(port)

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}
