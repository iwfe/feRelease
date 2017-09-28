const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017/feRelease'
const find = (params) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, (err, db) => {
      const col = db.collection('user')
      const d = col.find(params).toArray((err, db) => {
        if (err) return reject(err)
        if (db && db.length) {
          resolve(db)
        } else {
          reject('不存在此用户')
        }
      })
    })
  })
}

module.exports = {
  find
}
