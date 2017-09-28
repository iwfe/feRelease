const fs = require('fs')
const path = require('path')
const unzip = require('unzip')
const versionUrl = path.resolve(__dirname, '../config/version.json')
// const staticUrl = path.resolve(__dirname, '../assets/staticConfig.json')
const log = (str) => {console.log(str)}
const version = fs.existsSync(versionUrl)
// const conf = fs.existsSync(staticUrl)

let str = ''
if (version) {
  str = fs.readFileSync(versionUrl, 'utf8') // 不设置utf8，读取的是Buffer
} else {
  str = '{version:"0.0"}' // 必须是string
  fs.createWriteStream(versionUrl) // callback 就报错
  fs.writeFileSync(versionUrl, str)
}

// if (!conf) {
//   fs.createWriteStream(staticUrl)
// }

const getVersion = (str) => {
  const d = str.split('.')
  d[d.length - 1] = parseInt(d[d.length - 1]) + 1
  return d.join('.')
}

const d = eval("("+str+")")

const fn = () => {
  const dist = path.resolve(__dirname, '../dist')
  const name = '/' + fs.readdirSync(path.resolve(__dirname, '../dist'))[0]
  if (name) {
    fs.createReadStream(dist + name).pipe(unzip.Extract({ path: dist }))
    .on('close', () => {
      log('解压成功')
      const str = {}
      d.version = getVersion(d.version) // 增长版本号
      // fs.readFileSync(__dirname, '../dist/manifest.json', 'utf-8') // 不可用
      fs.readFile(path.resolve(__dirname, '../dist/manifest.json'), 'utf8', (err, data) => {
        if (err) throw err
        const obj = JSON.parse(data)
        for (let i = 0, len = obj.versionFiles.length; i < len; i++) {
          const val = obj.versionFiles[i]
          const file = val.replace(/[_0-9.]+/, (val) => {
            return '_' + d.version + '.' // 以json为准
          })
          fs.renameSync(path.resolve(__dirname, '../dist/' + val), path.resolve(__dirname, '../dist/' + file))
        }
        fs.writeFileSync(versionUrl, JSON.stringify(d)) // 更新版本号
      })
    })
  } else {
    log('找不到zip包')
  }
}

module.exports = fn

// 长路径创建
// const createFolder = function(to) {
//   const sep = path.sep
//   const folders = path.dirname(to).split(sep)
//   const p = ''
//   while (folders.length) {
//     p += folders.shift() + sep
//     if (!fs.existsSync(p)) {
//       fs.mkdirSync(p)
//     }
//   }
// }