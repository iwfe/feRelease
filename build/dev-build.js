if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse('"production"')
}
const fs = require('fs-extra')
fs.removeSync('./dist')
fs.removeSync('./zip')
const ip = require('ip')
const path = require('path')
const chalk = require('chalk')
const webpackTask = require('./build-common')
const express = require('express')
const webpackConfig = require('./webpack.prod')
const app = express()
const address = ip.address()
const port = process.env.PORT || 3002

app.set('views', __dirname + '/views')
app.engine('.html', require('ejs').renderFile)
app.get('*.do', (req, res) => {
  res.sendFile(path.resolve('dist/index.html'))
})

const url = path.join(__dirname, '../dist')
app.use('/', express.static(url))
app.use('/dist', express.static(url))
app.use('/', (req, res, next) => {
  const url = req.url
  const re = /\.js|css|ico|map$/
  if (!re.test(url)) {
    res.render('dev.html', {
      title: 'demo',
      vendor: 'vendor',
      item: 'app'
    })
  } else {
    next()
  }
})

app.listen(port, () => {
  process.stdout.clearLine()
  process.stdout.cursorTo(0)

  webpackConfig.output.publicPath = `//${address}:${port}/` // localhost/disthome.1.js
  webpackConfig.plugins.pop() // 移除压缩zip
  webpackConfig.watch = true

  webpackTask(webpackConfig, () => {
    console.log(chalk.yellow('prod %s'), `http://${address}:${port}\n`)
  })
})
