const app = require('./bin/app')
const conf = require('./config')
const ip = require('ip').address()
app.listen(conf.port, () => {
  console.log(`${ip}:${conf.port}`)
})
