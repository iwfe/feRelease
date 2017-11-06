const fs = require('fs')
const path = require('path')
const oss = require('ali-oss-extra').default
const _conf = fs.readFileSync(path.resolve(__dirname, '../config/oss.json'), 'utf8')
const log = (str) => console.log(str)

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





