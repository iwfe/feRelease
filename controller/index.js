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
  },

  // 测试用
  async get (ctx) {
    // const data = await ctx.myPool().query('SELECT * FROM iw_static_project')
    // const data = await mysql('test', 'select * from iw_static_resource where projectId=25 limit 10')
    await mysql('beta', 'update iw_static_project set onoff=1 where id=8')
    // const data = await ctx.myPool().query('select * from iw_static_resource where projectId=25')
    ctx.body = {
      status: 1
    }
  },

  async post (ctx) {
    const { name } = ctx.request.body
    console.log(name)
    ctx.body = {
      status: 1,
      data: name
    }
  }

  // async queryTest (ctx) {
  //   const sql = 'SELECT * FROM iw_static_project limit 25'
  //   const dataList = await query(sql)
  //   ctx.body = {
  //     status: 1,
  //     data: dataList
  //   }
  // }
}


// let readFileMd5 = (url) =>{
//   return new Promise((reslove) => {
//     let md5sum = crypto.createHash('md5');
//     let stream = fs.createReadStream(url);
//     stream.on('data', function(chunk) {
//       md5sum.update(chunk);
//     });
//     stream.on('end', function() {
//       let fileMd5 = md5sum.digest('hex');
//       reslove(fileMd5);
//     })
//   })
// }

