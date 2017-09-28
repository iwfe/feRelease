const Koa = require('koa')
const app = new Koa()
const path = require('path')
const cors = require('koa-cors') // generators
const mongo = require('koa-mongo') // generators
const views = require('koa-views')
const logger = require('koa-logger')
const favicon = require('koa-favicon')
const bodyParser = require('koa-bodyparser')
const util = require('../util')
const conf = require('../config')
const router = require('../router')
const http = require('http')
const server = http.createServer(app.callback())
require('../controller/socker')(server)

app.use(favicon(path.resolve(__dirname, '../favicon.ico')))
app.use(views('./view', { extension: 'ejs' }))
app.use(cors())
app.use(logger())
// app.use(util.logger)
app.use(util.engine)
app.use(bodyParser())
app.use(mongo(conf.mongodb))
app.use(router.routes())
app.on('error', util.error)

module.exports = server
