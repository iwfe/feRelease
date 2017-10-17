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
const formidable = require("formidable") // multipart/form-data 解析
const log = (str) => {console.log(str)}
const abs = (url) => path.resolve(__dirname, url)
let local = {}
let fileMd5 = {}

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
  createTmp: async (ctx, next) => {
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
          const bucket = conf['bucket_' + ctx._params.dev] // 对应的筒子 和 二级目录
          ctx._params.bucket = bucket[item[0].ossType - 1]
          log('上传文件成功')
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
      log('解压文件成功')
      await next()
    } else {
      util.fail(ctx, 20013)
    }
  },

  /*
    处理Manifest，要添加版本号的文件
   */
  processManifest: async (ctx, next) => {
    const params = ctx._params
    let manifest = []
    // 获取 manifest
    if (fs.existsSync(abs(`../tmp/${params.name}/manifest.json`))) {
      const mf = fs.readFileSync(abs(`../tmp/${params.name}/manifest.json`), 'utf8')
      const d = JSON.parse(mf)
      if (d.versionFiles && d.versionFiles.length) {
        manifest = d.versionFiles
      } else {
        // log('manifest 缺少 versionFiles')
      }
    } else {
      const mf = await mysql(params.dev, 'select * from iw_static_manifest where projectId=' + params.projectId)
      if (mf && mf.length) {
        for (let i = 0, len = mf.length; i < len; i++) {
          manifest.push(mf[i]['keyPath'])
        }
      } else {
        // log('manifest 没有记录此项目配置信息')
      }
    }

    // 生成 md5
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
    log('manifest 处理完成')
    await next()
  },

  /*
  对比变动和新增文件
  ...
  阻止上传.map文件
   */
  computedFiles: async (ctx) => {
    const add = {}
    const diff = {}
    const params = ctx._params
    const bucket = params.bucket.bucket

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
        util.forEach(diff, async (val, key) => {
          const _key = params.bucket.folder + params.devName + util.addVersion(key, params.version)
          await oss.uploadFileStream(bucket, _key, val).then(async (res) => {
            if (res && res.url) {
              const s = `update iw_static_resource set ossUrl='${res.url}', version='${params.version}', fileMd5='${_md5[key]}' where id=${_id[key]}`
              await mysql(params.dev, s)
            }
          })
        })
      }
      if (Object.keys(add).length) {
        util.forEach(add, async (val, key) => {
          const _key = params.bucket.folder + params.devName + util.addVersion(key, params.version)
          const _os = await oss.uploadFileStream(bucket, _key, val).then(async (res) => {
            log(res.url)
            if (res && res.url) {
              // if (params.dev === 'prod') {
              //   res.url = ''
              // }
              const date = await mysql(params.dev, 'select now()')
              const createTime = date[0]['now()'] // 创建时间
              const updateTime = date[0]['now()'] // 更新时间
              const fileMd5 = md5File.sync(val)
              const insert = `INSERT INTO iw_static_resource (keyPath,ossUrl,version,projectId,createTime,updateTime,fileMd5) VALUES ('${key}','${res.url}','${params.version}','${params.projectId}','${createTime}','${updateTime}','${fileMd5}')`
              const result = await mysql(params.dev, insert).then(() => {
                // console.log(res)
              }).catch((err) => {
                console.log('oss上传失败')
              })
            }
          })
        })
      }
    } else {
      util.forEach(local, async (val, key) => {
        const _key = params.bucket.folder + params.devName + util.addVersion(key, params.version)
        const _os = await oss.uploadFileStream(bucket, _key, val)
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
    let str = '#update time is ' + new Date().Format("yyyy-MM-dd hh:mm:ss") + '\n'
    const items = await mysql(params.dev, 'select * from iw_static_resource where projectId=' + params.projectId)
    util.forEach(items, (val, key) => {
      str += val['keyPath'] + '=' + val['ossUrl'] + '\n'
    })
    fs.openSync(abs('../tmp/staticResource.properties'), 'a')
    fs.writeFileSync(abs('../tmp/staticResource.properties'), str)
    await oss.uploadFileStream(bucket, params.bucket.folder + params.devName + 'staticResource.properties', abs('../tmp/staticResource.properties')).then((res) => {
      log(res.url)
    })

    // 生成开关文件
    str = '#update time is ' + new Date().Format("yyyy-MM-dd hh:mm:ss") + '\n'
    const conf_md5 = md5File.sync(abs('../tmp/staticResource.properties'))
    fs.openSync(abs('../tmp/staticResourceConfig.properties'), 'a')
    str += 'staticResourceMD5=' + conf_md5 + '\n'
    str += 'staticResourceMD5Order=' + conf_md5 + '\n'
    str += 'autoReload=false'
    fs.writeFileSync(abs('../tmp/staticResourceConfig.properties'), str)
    await oss.uploadFileStream(bucket, params.bucket.folder + params.devName + 'staticResourceConfig.properties', abs('../tmp/staticResourceConfig.properties')).then((res) => {
      log(res.url)
    })

    // if (Object.keys(add).length || Object.keys(diff).length) {
    await mysql(params.dev, 'update iw_static_project set version="' + params.version + '", onoff=0 where id=' + params.projectId)
    // }

    const result = {
      projectId: params.projectId,
      dev: params.dev,
      bucket,
      diff,
      add,
      time: new Date().Format("yyyy-MM-dd hh:mm:ss")
    }

    if (params.auto === 'open') {
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
    local = '' // 文件 本地路径
    fileMd5 = '' // 文件 md5
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
