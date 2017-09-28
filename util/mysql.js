const mysql = require('mysql')
const conf = require('../config')
// const pool2 = mysql.createPool(conf.mysql_test)

const common = (dev, sql, values) => {
  return new Promise((resolve, reject) => {
    mysql.createPool(conf['mysql_' + dev]).getConnection(function(err, connection) {
      if (err) {
        reject( err )
      } else {
        connection.query(sql, values, ( err, rows) => {
          if ( err ) {
            reject( err )
          } else {
            resolve( rows )
          }
          connection.release()
        })
      }
    })
  })
}
// http://xieyufei.com/2016/12/05/Nodejs-Query-Mysql.html
// https://chenshenhai.github.io/koa2-note/note/mysql/async.html
module.exports = common
