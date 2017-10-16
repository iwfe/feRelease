const fs = require('fs')
const rd = require('rd')
const path = require('path')
const unzip = require('unzip')
const fse = require('fs-extra')
const util = require('../util')
const conf = require('../config')
const oss = require('../util/oss')
const md5File = require('md5-file')
const mysql = require('../util/mysql')
const rp = require('request-promise')
const formidable = require("formidable") // multipart/form-data 解析
const log = (str) => {console.log(str)}
const abs = (url) => path.resolve(__dirname, url)
// 未做处理
// 阻止上传.map文件
//
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}


const upload = {
  /*
    效验参数是否合法
    上传zip包到临时目录
   */
  createFile: async (ctx, next) => {
    fse.emptyDirSync(abs('../tmp'))

    const form = new formidable.IncomingForm()
      form.keepExtensions = true
      form.uploadDir = abs('../tmp')
      form.encoding = 'utf-8'

    const parseZip = () => {
      return new Promise((resolve, reject) => {
        form.on('file', (field, file) => {
          if (field === 'file' && file.path) {
            fs.renameSync(file.path, form.uploadDir + "/" + file.name)
          } else {
            reject()
          }
        })
        form.parse(ctx.req, (err, fields, files) => {
          const name = files.file.name.replace(/.zip$/, '')
          const {
            dev,
            version,
            projectId
          } = fields

          if (!util.getDev(dev) && !projectId) {
            reject(1006)
            return // reject 后代码会继续执行
          }

          // 兼容 命令上传
          if (!version) {
            const arr = item[0].version.split('.')
            ctx._params.version = parseInt(arr[arr.length - 1]) + 1
          }

          // name 带 _test 和 _beta 环境为标识
          if (dev === 'test' || dev === 'beta') {
            fields['devName'] = name + '_' + dev + '/'
          } else {
            fields['devName'] = ''
          }
          fields['name'] = name
          resolve(fields)
        })
      })
    }

    await parseZip().then(async (params) => {
      ctx._params = params
      const item = await mysql(ctx._params.dev, 'select * from iw_static_project where id=' + ctx._params.projectId)
      if (item || ctx._params.name === item[0].folderName) {
        if (item[0].ossType >= 1 && item[0].ossType <= 3 ) {
          const bucket = conf['bucket_' + ctx._params.dev] // 对应的筒子 和 二级目录
          ctx._params.bucket = bucket[item[0].ossType - 1]
          await next()
        } else {
          util.fail(ctx, 20012)
        }
      } else {
        util.fail(ctx, 20011)
      }
    }).catch((code) => {
      util.fail(ctx, code)
    })
  },

  /*
    解压zip
    统一目录层级
   */
  unZip: async (ctx, next) => {
    const files = fs.readdirSync(abs('../tmp'))

    if (!files && files.length > 1) {
      util.fail(ctx, 20013)
      return
    }

    const name = files[0]
    if (name) {
      // 解压
      const _unzip = () => {
        return new Promise((resolve, reject) => {
          fs.createReadStream(abs('../tmp/' + name))
          .pipe(unzip.Extract({ path: abs('../tmp') }))
          .on('close', (res) => {
            resolve()
          })
        })
      }

      await _unzip().then(() => {
        const itemname = ctx._params.name
        const _path = fs.existsSync(abs('../tmp/' + itemname))
        if (!_path) {
          const _files = fs.readdirSync(abs('../tmp/')) // 解压出来不包含文件夹
          if (_files.length > 1) {
            fs.mkdirSync(abs('../tmp/' + itemname))
            util.forEach(_files, (val) => {
              fs.renameSync(abs('../tmp/' + val), abs('../tmp/' + itemname + '/' + val))
            })
            fs.unlinkSync(abs('../tmp/' + itemname + '/' + name))
          } else {
            util.fail(ctx, 20014)
            return
          }
        } else {
          fs.unlinkSync(abs('../tmp/' + name))
          // 加压出来是文件目录，就不去效验文件下的文件了
        }
      })

      await next()
    } else {
      util.fail(ctx, 20013)
      return
    }
  },

  computedFiles: async (ctx) => {
    const _oss = oss()
    const params = ctx._params
    const bucket = params.bucket.bucket
    const resource = params.bucket.folder
    let manifest = [] // 需要加版本号的文件

    // 获取 manifest
    if (fs.existsSync(abs(`../tmp/${params.name}/manifest.json`))) {
      const _manifest = fs.readFileSync(abs(`../tmp/${params.name}/manifest.json`), 'utf8')
      const d = JSON.parse(_manifest)
      if (d.versionFiles && d.versionFiles.length) {
        manifest = d.versionFiles
      } else {
        log('manifest 缺少 versionFiles')
      }
    } else {
      const _manifest = await mysql(params.dev, 'select * from iw_static_manifest where projectId=' + params.projectId)
      if (_manifest && _manifest.length) {
        for (let i = 0, len = _manifest.length; i < len; i++) {
          manifest.push(_manifest[i]['keyPath'])
        }
      } else {
        log('manifest 没有记录此项目')
      }
    }

    // 过滤文件
    const md5 = {}
    const local = {}
    const files = rd.readSync(path.resolve(__dirname, '../tmp/' + params.name))

    util.forEach(files, (val) => {
      const n = val.indexOf('.')
      if (n >= 0) {
        const len = val.indexOf(params.name)
        if (len > 1) {
          const keyPath = val.slice(len + params.name.length + 1)
          local[keyPath] = val
        }
      }
    })

    if (manifest.length) {
      util.forEach(manifest, (val) => {
        md5[val] = md5File.sync(local[val])
      })
    } else {
      util.forEach(local, (val, key) => {
        md5[key] = md5File.sync(val)
      })
    }

    // 查询项目
    const item = await mysql(params.dev, 'select * from iw_static_resource where projectId=' + params.projectId)
    const add = {}
    const diff = {}
    if (item && item.length) {
      const _id = {}
      const _db = {}
      const _md5 = {}

      // 生成 key = md5, key = id
      util.forEach(item, (val, key) => {
        _db[val['keyPath']] = item[key].fileMd5
        _id[val['keyPath']] = item[key].id
      })

      util.forEach(local, (val, key) => {
        if (!_db[key]) {
          add[key] = local[key] // 新增
        }
      })

      util.forEach(md5, (val, key) => {
        // 如果数据库不存在 或者上次上传失败
        // _db[key] 就等于 undefined
        // undefined !== md5 就成立了
        // 因此变更文件会出现新增文件
        if (_db[key] && _db[key] !== val) {
          diff[key] = local[key] // 变动
          _md5[key] = val // md5
        }
      })

      // if (Object.keys(diff).length) {
      //   util.forEach(diff, async (val, key) => {
      //     const _key = resource + params.devName + util.addVersion(key, params.version)
      //     await _oss.uploadFileStream(bucket, _key, val).then(async (res) => {
      //       if (res && res.url) {
      //         const s = `update iw_static_resource set ossUrl='${res.url}', version='${params.version}', fileMd5='${_md5[key]}' where id=${_id[key]}`
      //         await mysql(params.dev, s)
      //       }
      //     })
      //   })
      // } else {
      //   log('没有变动文件')
      // }

      // if (Object.keys(add).length) {
      //   util.forEach(add, async (val, key) => {
      //     const _key = resource + params.devName + util.addVersion(key, params.version)
      //     const _os = await _oss.uploadFileStream(bucket, _key, val).then(async (res) => {
      //       if (res && res.url) {
      //         // if (params.dev === 'prod') {
      //         //   res.url = ''
      //         // }
      //         const date = await mysql(params.dev, 'select now()')
      //         const createTime = date[0]['now()'] // 创建时间
      //         const updateTime = date[0]['now()'] // 更新时间
      //         const fileMd5 = md5File.sync(val)
      //         const insert = `INSERT INTO iw_static_resource (keyPath,ossUrl,version,projectId,createTime,updateTime,fileMd5) VALUES ('${key}','${res.url}','${params.version}','${params.projectId}','${createTime}','${updateTime}','${fileMd5}')`
      //         const result = await mysql(params.dev, insert).then(() => {
      //           console.log(res)
      //         }).catch((err) => {
      //           console.log('添加文件失败')
      //         })
      //       }
      //     })
      //   })
      // } else {
      //   log('没有新增文件')
      // }
    } else {
      // 新上传的项目
      util.forEach(local, async (val, key) => {
        const _key = resource + params.devName + util.addVersion(key, params.version)
        const _os = await _oss.uploadFileStream(bucket, _key, val)
        _os.then( async (res) => {
          if (res && res.url) {
            // if (params.dev === 'prod') {
              // 正式环境 来自 cdn 域名
            // }
            const date = await mysql(params.dev, 'select now()')
            const createTime = date[0]['now()']
            const updateTime = date[0]['now()']
            const fileMd5 = md5File.sync(val)
            await mysql(params.dev, `INSERT INTO iw_static_resource (keyPath,ossUrl,version,projectId,createTime,updateTime,fileMd5) VALUES ('${key}','${res.url}','${params.version}','${params.projectId}','${createTime}','${updateTime}',${fileMd5})`)
          }
        })
      })
    }

    // 生成配置文件
    // const date = new Date()
    // let str = '#update time is ' + new Date().Format("yyyy-MM-dd hh:mm:ss") + '\n'
    // const items = await mysql(params.dev, 'select * from iw_static_resource where projectId=' + params.projectId)
    // if (!items || items.length <= 0) {
    //   log('应该不存在此情况')
    //   return
    // }
    // util.forEach(items, (val, key) => {
    //   str += val['keyPath'] + '=' + val['ossUrl'] + '\n'
    // })
    // fs.openSync(abs('../tmp/staticResource.properties'), 'a')
    // fs.writeFileSync(abs('../tmp/staticResource.properties'), str)
    // await _oss.uploadFileStream(bucket, resource + params.devName + 'staticResource.properties', abs('../tmp/staticResource.properties')).then((res) => {
    //   log(res.url)
    // })

    // 生成开关文件
    // str = '#update time is ' + new Date().Format("yyyy-MM-dd hh:mm:ss") + '\n'
    // const conf_md5 = md5File.sync(abs('../tmp/staticResource.properties'))
    // fs.openSync(abs('../tmp/staticResourceConfig.properties'), 'a')
    // str += 'staticResourceMD5=' + conf_md5 + '\n'
    // str += 'staticResourceMD5Order=' + conf_md5 + '\n'
    // str += 'autoReload=false'
    // fs.writeFileSync(abs('../tmp/staticResourceConfig.properties'), str)
    // await _oss.uploadFileStream(bucket, resource + params.devName + 'staticResourceConfig.properties', abs('../tmp/staticResourceConfig.properties')).then((res) => {
    //   log(res.url)
    // })

    // if (Object.keys(add).length || Object.keys(diff).length) {
    //   await mysql(params.dev, 'update iw_static_project set version="' + params.version + '", onoff=0 where id=' + params.projectId)
    // }

    const result = {
      projectId: params.projectId,
      dev: params.dev,
      bucket,
      diff,
      add,
      time: new Date().Format("yyyy-MM-dd hh:mm:ss")
    }

    // if (params.auto === 'open') {
    //   ctx.request.query.id = params.projectId
    //   ctx.request.query.dev = params.dev
    //   ctx.request.query.name = params.name
    //   await upload.open(ctx).then((res) => {
    //     if (res.status === 1) {
    //       result.auto = true
    //     }
    //   })
    // }
    util.success(ctx, result)
  },

  open: async (ctx) => {
    /*
      id 项目id
      dev 环境
      name 项目名
     */
    const { id, dev, name } = ctx.request.query
    if (!id || !dev || !name) {
      util.fail(ctx, 1006)
      return
    }
    if (!util.getDev(dev)) {
      util.fail(ctx, 1007)
      return
    }

    const open = 'staticResourceConfig.properties'
    await mysql(dev, `update iw_static_project set onoff=1 where id=${id}`)

    let devName = ''
    if (dev === 'test' || dev === 'beta') {
      devName = name + '_' + dev + '/'
    } else {
      devName = ''
    }

    const url = conf.staticConf + name + '_' + dev + '/' + open

    fs.openSync(abs('../tmp/' + open), 'a')
    rp(url).then(async (res) => {
      const _oss = oss()
      const str = res.replace('false', 'true')
      fs.writeFileSync(abs('../tmp/' + open), str)
      await _oss.uploadFileStream('fe-release', devName + open, abs('../tmp/' + open))
    })

    util.success(ctx)

    return {
      status: 1
    }
  }
}

module.exports = upload
