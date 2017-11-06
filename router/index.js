const Router = require('koa-router')
const busboy = require('koa-busboy')
const util = require('../util')
const conf = require('../config')
const control = require('../controller')
const menu = require('../controller/menu')
const item = require('../controller/item')
const user = require('../controller/user')
const log = require('../controller/log')
const upload = require('../controller/upload')
const uploadStatic = busboy(conf.staticDirectory)
// const uploadImage = busboy(conf.staticDirectory)
const route = new Router({ prefix: '/' })

route.get('', util.checkLogin, util.getUser, util.render)
route.get('signin', util.render)
route.get('search', util.checkLogin, util.getUser, util.render)
route.get('all', util.checkLogin, util.getUser, util.render)
route.get('star', util.checkLogin, util.getUser, util.render)
route.get('home/*', util.checkLogin, util.getUser, util.render)

route.post('signin', user.signin)
route.post('signup', user.signup)
route.post('signout', user.signout)

route.patch('app/user', util.checkLogin, user.patch)

route.get('app/menu', menu.get)
route.post('app/menu', util.checkLogin, menu.post)
route.patch('app/menu', util.checkLogin, menu.patch)
route.get('app/addDev', util.checkLogin, menu.addDev)

route.patch('app/updateItem', util.checkLogin, item.updateItem)
route.del('app/deleteItem', util.checkLogin, item.delItem)
route.post('app/createItem', util.checkLogin, item.createItem)
route.get('app/getItemAll', util.checkLogin, item.getItemAll)
route.post('app/getItemStar', util.checkLogin, item.getItemStar)
route.get('app/getItemRecent', util.checkLogin, item.getItemRecent)

route.get('app/openUpoad', util.checkLogin, upload.open)
// route.post('app/uploadItem', util.checkLogin, upload.createFile, upload.unZip, upload.computedFiles)
// route.post('uploadImg', util.checkLogin, config.)
route.post('app/uploadItem', util.checkLogin, upload.createTmp, upload.unZip, upload.processManifest, upload.computedFiles)
route.post('uploadStatic', control.staticCheckKey, uploadStatic, control.staticUpload)

route.post('app/logger', util.checkLogin, log.post)
route.get('app/logger', log.get)
route.post('feRelease', upload.createTmp, upload.unZip, upload.processManifest, upload.computedFiles)

route.get('*', util.render)

module.exports = route