const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const unzip = require('unzip')
const util = require('../util')
const mysql = require('../util/mysql')
const conf = require('../config')

module.exports = {

  async staticCheckKey (ctx, next) {
    try {
      fse.emptyDirSync(path.resolve(__dirname, '../dist'))
    }
    catch (err) {
      fs.mkdirSync('dist')
    }
    if (ctx.request.headers.key === conf.staticKey) {
      await next()
    } else {
      util.fail(ctx)
    }
  },

  async staticUpload (ctx) {
    const dist = path.resolve(__dirname, '../dist')
    const name = '/' + fs.readdirSync(path.resolve(__dirname, '../dist'))[0]
    const Unzip = () => {
      return new Promise((resolve, reject) => {
        fs.createReadStream(dist + name)
        .pipe(unzip.Extract({ path: dist }))
        .on('close', () => {
          resolve()
        })
      })
    }
    if (name) {
      await Unzip().then(() => {
        util.success(ctx)
      })
    } else {
      util.fail(ctx)
    }
  }
}
