const webpackConfig = require('./webpack.dev')
const webpackTask = require('./build-common')
const log = (str) => {console.log(str)}
const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')
fse.emptyDirSync(path.resolve(__dirname, '../dist'))

webpackConfig.watch = true
webpackConfig.plugins.splice(4, 1)
webpackTask(webpackConfig)
