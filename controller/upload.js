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

// 阻止上传.map文件
const upload = {
  createFile: async (ctx, next) => {
    fse.emptyDirSync(abs('../tmp')) // 清空
    const form = new formidable.IncomingForm() // 创建解析formdata对象
    form.uploadDir = abs('../tmp') // 上传目录
    form.keepExtensions = true // 保留扩展名
    const parseZip = () => { // 解析参数
      return new Promise((resolve, reject) => {
        form.on('file', (field, file) => {
          fs.renameSync(file.path, form.uploadDir + "/" + file.name) // 完整包名
        })

        form.parse(ctx.req, (err, fields, files) => {
          const params = fields // 参数files里, zip对象在files
          params['name'] = files.file.name.replace(/.zip$/, '') // 过滤后缀
          resolve(params)
        })
      })
    }

    ctx._params = await parseZip()

    const {
      dev,
      name,
      version,
      projectId
    } = ctx._params

    if (dev === 'test' || dev === 'beta') {
      ctx._params.devName = name + '_' + dev + '/'
    } else {
      ctx._params.devName = '' // 向上环境暂时没验证
    }

    if (!util.getDev(dev)) {
      util.fail(ctx, 1007)
      return
    }

    if (!projectId || !name) {
      util.fail(ctx, 1006)
      return
    }

    const item = await mysql(dev, 'select * from iw_static_project where id=' + projectId)
    if (!item || name.indexOf(item[0].folderName)) {
      util.fail(ctx, 20011)
      return
    }

    if (!version) {
      const arr = item[0].version.split('.')
      ctx._params.version = parseInt(arr[arr.length - 1]) + 1
    }

    // 计算筒
    const bucket = conf['bucket_' + dev]
    ctx._params.bucket = bucket[item[0].ossType - 1]

    await next()
  },

  unZip: async (ctx, next) => {
    const files = fs.readdirSync(abs('../tmp'))
    if (files && files.length >= 1) {
      // 获取item名称
      const name = files[0]
      if (name) {
        const pro = () => {
          return new Promise((resolve, reject) => {
            fs.createReadStream(abs('../tmp/' + name)) // 读取
            .pipe(unzip.Extract({ path: abs('../tmp') })) // 解压
            .on('close', () => {
              // 过滤项目名
              const itemName = name.replace(/.zip/, '')
              const url = fs.existsSync(abs('../tmp/' + itemName)) // 路径是否存在
              // 路径是否存在
              if (!url) {
                // 不存在目录文件
                const _files = fs.readdirSync(abs('../tmp/'))
                if (_files.length > 1) {
                  fs.mkdirSync(abs('../tmp/' + itemName))
                  util.forEach(_files, (val) => {
                    fs.renameSync(abs('../tmp/' + val), abs('../tmp/' + itemName + '/' + val))
                  })
                } else {
                  reject('zip里没有文件')
                  console.log('请确认zip包是否解压出来，解压出来是否有文件存在')
                }
                // 解压完后在删除zip
                fs.unlink(abs('../tmp/' + name.replace(/.zip/, '') + '/' + name), () => { // 移除
                  resolve(name) // 返回项目名字
                })
              } else {
                fs.unlink(abs('../tmp/' + name), () => { // 移除
                  resolve(name) // 返回项目名字
                })
              }
            })
          })
        }
        await pro()
        await next()
      } else {
        log('临时文件里不存在zip包')
      }
    } else {
      log('临时文件为空，请确认上传包是否存在！')
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

      if (Object.keys(diff).length) {
        util.forEach(diff, async (val, key) => {
          const _key = resource + params.devName + util.addVersion(key, params.version)
          await _oss.uploadFileStream(bucket, _key, val).then(async (res) => {
            if (res && res.url) {
              const s = `update iw_static_resource set ossUrl='${res.url}', version='${params.version}', fileMd5='${_md5[key]}' where id=${_id[key]}`
              await mysql(params.dev, s)
            }
          })
        })
      } else {
        log('没有变动文件')
      }

      if (Object.keys(add).length) {
        util.forEach(add, async (val, key) => {
          const _key = resource + params.devName + util.addVersion(key, params.version)
          const _os = await _oss.uploadFileStream(bucket, _key, val).then(async (res) => {
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
                console.log(res)
              }).catch((err) => {
                console.log('添加文件失败')
              })
            }
          })
        })
      } else {
        log('没有新增文件')
      }
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
    const date = new Date()
    let str = '#update time is ' + new Date().Format("yyyy-MM-dd hh:mm:ss") + '\n'
    const items = await mysql(params.dev, 'select * from iw_static_resource where projectId=' + params.projectId)
    if (!items || items.length <= 0) {
      log('应该不存在此情况')
      return
    }
    util.forEach(items, (val, key) => {
      str += val['keyPath'] + '=' + val['ossUrl'] + '\n'
    })
    fs.openSync(abs('../tmp/staticResource.properties'), 'a')
    fs.writeFileSync(abs('../tmp/staticResource.properties'), str)
    await _oss.uploadFileStream(bucket, resource + params.devName + 'staticResource.properties', abs('../tmp/staticResource.properties')).then((res) => {
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
    await _oss.uploadFileStream(bucket, resource + params.devName + 'staticResourceConfig.properties', abs('../tmp/staticResourceConfig.properties')).then((res) => {
      log(res.url)
    })

    if (Object.keys(add).length || Object.keys(diff).length) {
      await mysql(params.dev, 'update iw_static_project set version="' + params.version + '", onoff=0 where id=' + params.projectId)
    }

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
      await upload.open(ctx).then((res) => {
        if (res.status === 1) {
          result.auto = true
        }
      })
    }
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
