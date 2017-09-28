const fs = require('fs')
const path = require('path')
const log = str => console.log(str)

// const manifest = fs.readFile(path.resolve(__dirname, '../dist/manifest.json'), 'utf8', (err, data) => {
//   // 版本号
//   const json = fs.readFileSync(path.resolve(__dirname, '../config/version.json'), 'utf8')
//   const version = JSON.parse(json).version
//   if (err) throw err
//   const arr = JSON.parse(data).versionFiles
//   for (let i = 0, len = arr.length; i < len; i++) {
//     const val = arr[i]
//     const v = val.replace(/[_0-9.]+/, (val) => {
//       return '_' + version + '.' // 以json为准
//     })
//     fs.renameSync(path.resolve(__dirname, '../dist/' + val), path.resolve(__dirname, '../dist/' + v)) // 遍历修改所有文件
//   }
// })

// module.exports = manifest

const md5File = require('md5-file')
const d = fs.readSync(path.resolve(__dirname, '../tmp/iwjw-wxent'))
log(d)

// for (var i = 0,len = ) {

// }
// const hash = md5File.sync(path.resolve(__dirname, '../tmp/iwjw-wxent/add_order.js'))
