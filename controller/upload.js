const fs = require('fs')
const rd = require('rd')
const path = require('path')
const unzip = require('unzip')
const fse = require('fs-extra')
const util = require('../util')
const conf = require('../config')
const oss = require('../util/oss')()
const md5File = require('md5-file')
const mysql = require('../util/mysql')
const rp = require('request-promise')
const request = require('request')
const formidable = require("formidable") // multipart/form-data 解析
const log = console.log
const abs = (url) => path.resolve(__dirname, url)
let local = {}
let fileMd5 = {}
let text = ''

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
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length))
  for (var k in o)
  if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)))
  return fmt
}


const upload = {
  /*
    效验参数是否合法
    上传zip包到临时目录
   */
  createTmp: async (ctx, next) => {
    log('上传文件')
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
            return
          }

          // 命令模式
          if (!version) {
            const arr = item[0].version.split('.')
            ctx._params.version = parseInt(arr[arr.length - 1]) + 1
          }

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
          const bucket = conf['bucket_' + ctx._params.dev]
          ctx._params.bucket = bucket[item[0].ossType - 1]
          await next()
          log('上传文件成功')
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
    log('解压文件')
    const files = fs.readdirSync(abs('../tmp'))

    if (!files && files.length > 1) {
      util.fail(ctx, 20013)
      return
    }

    const name = files[0]
    if (name) {
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
      const files = rd.readSync(path.resolve(__dirname, '../tmp/' + ctx._params.name))
      util.forEach(files, (val) => {
        const len = val.indexOf(ctx._params.name)
        const keyPath = val.slice(len + ctx._params.name.length + 1)
        if (keyPath && keyPath.indexOf('.') >= 0) { // 过滤目录，目录不能生成md5
          local[keyPath] = val
        }
      })
      await next()
      log('解压文件成功')
    } else {
      util.fail(ctx, 20013)
    }
  },

  /*
    处理Manifest，要添加版本号的文件
   */
  processManifest: async (ctx, next) => {
    log('处理manifest')
    const params = ctx._params
    let manifest = []
    if (fs.existsSync(abs(`../tmp/${params.name}/manifest.json`))) {
      const mf = fs.readFileSync(abs(`../tmp/${params.name}/manifest.json`), 'utf8')
      const d = JSON.parse(mf)
      if (d.versionFiles && d.versionFiles.length) {
        manifest = d.versionFiles
      }
    } else {
      const mf = await mysql(params.dev, 'select * from iw_static_manifest where projectId=' + params.projectId)
      if (mf && mf.length) {
        for (let i = 0, len = mf.length; i < len; i++) {
          manifest.push(mf[i]['keyPath'])
        }
      }
    }

    if (manifest.length) {
      util.forEach(manifest, (val) => {
        const key = local[val]
        fileMd5[val] = md5File.sync(key)
      })
    } else {
      util.forEach(local, (val, key) => {
        fileMd5[key] = md5File.sync(val)
      })
    }
    await next()
    log('处理manifest成功')
  },

  /*
  对比变动和新增文件
  注意不要被nginx拦截
   */
  computedFiles: async (ctx) => {
    log('查找新增和改动的文件')
    const add = {}
    const diff = {}
    const params = ctx._params
    const bucket = params.bucket.bucket
    const itemPath = params.bucket.folder + params.devName
    const item = await mysql(params.dev, 'select * from iw_static_resource where projectId=' + params.projectId)
    if (item && item.length) {
      const _id = {}
      const _db = {}
      const _md5 = {}

      util.forEach(item, (val, key) => {
        _db[val['keyPath']] = item[key].fileMd5 // 部分文件md5 为空字符串
        _id[val['keyPath']] = item[key].id
      })
      const _r = Object.keys(_db)
      util.forEach(local, (val, key) => {
        if (_r.indexOf(key) <= -1) {
          add[key] = local[key]
        }
      })
      if (Object.keys(add).length) {
        log('处理新增文件')
        for (const key in add) {
          const _key = itemPath + util.addVersion(key, params.version)
          await oss.uploadFileStream(bucket, _key, add[key]).then(async (res) => {
            if (res && res.url) {
              res.url = res.url.replace('http:', '')
              /* 处理发布环境url */
              // if (params.dev === 'prod') {
              //   res.url = ''
              // }
              const date = await mysql(params.dev, 'select now()')
              const createTime = date[0]['now()']
              const updateTime = date[0]['now()']
              const _md5 = md5File.sync(add[key])
              const sql = `INSERT INTO iw_static_resource (keyPath,ossUrl,version,projectId,createTime,updateTime,_md5) VALUES ('${key}','${res.url}','${params.version}','${params.projectId}','${createTime}','${updateTime}','${fileMd5}')`
              const result = await mysql(params.dev, sql).then((res) => {
                log(res)
              }).catch((err) => {
                util.fail(ctx, 20018)
                return
              })
            } else {
              util.fail(ctx, 20016)
              return
            }
          })
        }
      }
      util.forEach(fileMd5, (val, key) => {
        // 如果数据库不存在 或者上次上传失败
        // _db[key] 就等于 undefined
        // undefined !== md5 就成立了
        // 因此变更文件会出现新增文件
        if (_db[key] && _db[key] !== val) {
          diff[key] = local[key] // 变动
          _md5[key] = val
        }
      })
      if (Object.keys(diff).length) {
        log('处理变动文件')
        for (const key in diff) {
          const _key = itemPath + util.addVersion(key, params.version)
          await oss.uploadFileStream(bucket, _key, diff[key]).then(async (res) => {
            if (res && res.url) {
              res.url = res.url.replace('http:', '')
              /* 处理发布环境url */
              // if (params.dev === 'prod') {
              //   res.url = ''
              // }
              const sql = `update iw_static_resource set ossUrl='${res.url}', version='${params.version}', fileMd5='${_md5[key]}' where id=${_id[key]}`
              await mysql(params.dev, sql).then((res) => {
                log(res)
              }).catch((err) => {
                util.fail(ctx, 20017)
                return
              })
            } else {
              util.fail(ctx, 20016)
              return
            }
          }).catch((err) => {
            log(err)
            util.fail(ctx, 20016)
            return
          })
        }
      }
    } else {
      log('处理新增项目')
      for (const key in local) {
        const _key = itemPath + util.addVersion(key, params.version)
        await oss.uploadFileStream(bucket, _key, local[key]).then(async (res) => {
          if (res && res.url) {
            res.url = res.url.replace('http:', '')
            // if (params.dev === 'prod') {
              // 正式环境 来自 cdn 域名
            // }
            const date = await mysql(params.dev, 'select now()')
            const createTime = date[0]['now()']
            const updateTime = date[0]['now()']
            const fileMd5 = md5File.sync(local[key])
            await mysql(params.dev, `INSERT INTO iw_static_resource (keyPath,ossUrl,version,projectId,createTime,updateTime,fileMd5) VALUES ('${key}','${res.url}','${params.version}','${params.projectId}','${createTime}','${updateTime}',${fileMd5})`)
          }
        }).catch((err) => {
          log(err)
          util.fail(ctx, 20016)
          return
        })
      }
    }

    log('生成配置文件')
    text = '#update time is ' + new Date().Format("yyyy-MM-dd hh:mm:ss") + '\n'
    const items = await mysql(params.dev, 'select * from iw_static_resource where projectId=' + params.projectId)

    util.forEach(items, (val, key) => {
      text += val['keyPath'] + '=' + val['ossUrl'] + '\n'
    })
    fs.openSync(abs('../tmp/staticResource.properties'), 'a')
    fs.writeFileSync(abs('../tmp/staticResource.properties'), text)
    // 外层添加花括号 再去生成 md5 值,试试
    // let _files = fs.readFileSync(abs('../tmp/staticResource.properties')), 'utf8')
    // log(_files)
    // 处理成 {a=b,c=d} 再去生成 conf_md5
    const conf_md5 = md5File.sync(abs('../tmp/staticResource.properties'))
    await oss.uploadFileStream(bucket, itemPath + 'staticResource.properties', abs('../tmp/staticResource.properties')).then((res) => {
      // log(res.url)
    })

    log('生成开关文件')
    text = '#update time is ' + new Date().Format("yyyy-MM-dd hh:mm:ss") + '\n'
    fs.openSync(abs('../tmp/staticResourceConfig.properties'), 'a')
    text += 'staticResourceMD5=' + conf_md5 + '\n'
    text += 'staticResourceMD5Order=' + conf_md5 + '\n'
    text += 'autoReload=false'
    fs.writeFileSync(abs('../tmp/staticResourceConfig.properties'), text)
    await oss.uploadFileStream(bucket, itemPath + 'staticResourceConfig.properties', abs('../tmp/staticResourceConfig.properties')).then((res) => {
      // log(res.url)
    })

    /* 更新数据项目表 */
    // if (Object.keys(add).length || Object.keys(diff).length) {
    await mysql(params.dev, 'update iw_static_project set version="' + params.version + '", onoff=0 where id=' + params.projectId)
    // }

    const result = {
      projectId: params.projectId,
      version:  params.version,
      dev: params.dev,
      bucket,
      diff,
      add,
      time: new Date().Format("yyyy-MM-dd hh:mm:ss")
    }

    if (params.auto === 'open') {
      log('自动开启')
      ctx.request.query.id = params.projectId
      ctx.request.query.dev = params.dev
      ctx.request.query.name = params.name
      ctx.request.query.auto = true

      await upload.open(ctx).then((res) => {
        if (res.status === 1) {
          result.auto = true
        }
      })
    }
    local = ''
    fileMd5 = ''
    util.success(ctx, result)
  },

  open: async (ctx) => {
    /*
      id 项目id
      dev 环境
      name 项目名
     */
    const { id, dev, name, auto } = ctx.request.query
    if (!id || !dev || !name) {
      util.fail(ctx, 1006)
      return
    }
    if (!util.getDev(dev)) {
      util.fail(ctx, 1007)
      return
    }

    const up = await mysql(dev, `update iw_static_project set onoff=1 where id=${id}`)
    /*
      {
        fieldCount: 0,
        affectedRows: 1,
        insertId: 0,
        serverStatus: 2050,
        warningCount: 0,
        message: '(Rows matched: 1  Changed: 1  Warnings: 0',
        protocol41: true,
        changedRows: 1
      }
    */

    let devName = ''
    if (dev === 'test' || dev === 'beta') {
      devName = name + '_' + dev + '/'
    } else {
      devName = ''
    }

    const item = await mysql(dev, `select * from iw_static_project where id=${id}`)
    if (!item || !item.length) {
      util.fail(ctx, 20009)
      return
    }
    const cf = conf['bucket_' + dev]
    const path = item[0].onoffPath
    const bucket = cf[item[0].ossType - 1]
    const SRC = 'staticResourceConfig.properties'
    fs.openSync(abs('../tmp/' + SRC), 'a') // 原件存在不会覆盖
    await rp('http:' + path).then(async (res) => {
      const str = res.replace('false', 'true')
      fs.writeFileSync(abs('../tmp/' + SRC), str) // 写入
      await oss.uploadFileStream(bucket.bucket, bucket.folder + devName + SRC, abs('../tmp/' + SRC)).then((res) => {
        if (res && res.url && !auto) {
          util.success(ctx)
        }
      })
    })

    return {
      status: 1
    }
  }
}

module.exports = upload

