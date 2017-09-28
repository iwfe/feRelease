/*
  上传 zip 包
 */
const fs = require('fs')
const path = require('path')
const fse = require('fs-extra')
const request = require('request')
const conf = require('../config')
const log = (str) => {console.log(str)}
const url = path.resolve(__dirname, '../zip/' + require('../package.json').name + '.zip' )

if (fs.existsSync(url)) {
  request.post({
    url: conf.staticUrl,
    headers: { 'key': conf.staticKey },
    formData: {
      file: fs.createReadStream(url)
    }
  }, (err, res, body) => {
    body = JSON.parse(body)
    if (body && body.status === 1) {
      log('上传成功')
    } else {
      log('上传失败，确认读取到zip包内容')
      log(err)
    }
  })
} else {
  log('请检查zip包是否存在')
}

