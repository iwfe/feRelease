// const co = require('co')
const fs = require('fs')
const path = require('path')
// const OSS = require('ali-oss')
const oss = require('ali-oss-extra').default
const _conf = fs.readFileSync(path.resolve(__dirname, '../config/oss.json'), 'utf8')
const log = (str) => console.log(str)

/*
  max-keys : 5
  prefix: name
  //fe-release.oss-cn-hangzhou.aliyuncs.com/
*/
const method = (params = {}) => {
  const store = new oss(Object.assign({}, JSON.parse(_conf), params))
  return {
    // bucket
    getBucket (params = {}) {
      return store.listBuckets(params) // res.buckets
    },
    // item list
    getList (name, params = {}) {
      store.useBucket(name)
      return store.list(params)
    },
    // create bucket
    addBucket (name) {
      return store.putBucket(name)
    },
    // upload file
    uploadFileStream (bucket, key, file) {
      store.useBucket(bucket)
      const stream = fs.createReadStream(file)
      return store.putStream(key, stream)
    },
    // delete file
    delFile (bucket, key) {
      store.useBucket(bucket)
      return store.delete(key)
    }
  }
}

module.exports = method

// const os = method()

// os.delFile('fe-release', 'haha/haha.js').then((res) => {
//   log(res)
// })

// os.uploadFileStream('fe-release', 'haha/haha.js', path.join(__dirname, '../tmp/staticResource.properties')).then((res) => {
//   log(res)
// })

// os.addBucket('fe-release').then((res) => {
//   log(res)
// })






