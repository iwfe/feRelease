const uuidV1 = require('uuid/v1')
const conf = require('../config')
const util = require('../util')
const msg = require('../config/msg')
const menu = 'menu'

module.exports = {

  get: async (ctx) => {
    const data = await ctx.mongo.db(conf.mongodb.db).collection(menu).find().toArray()
    util.success(ctx, data)
  },

  post: async (ctx) => {
    const { name } = ctx.request.body

    if (name) {
      const id = uuidV1().replace(/\-/g, '')
      await ctx.mongo.db(conf.mongodb.db).collection(menu).insert({id, name}).then((res) => {
        if (res.result.ok === 1) {
          util.success(ctx, res.ops)
        } else {
          util.fail(ctx, msg[1005])
        }
      })
    }
  },

  patch: async (ctx) => {
    const { menus } = ctx.request.body
    if (menus && menus.length) {
      await ctx.mongo.db(conf.mongodb.db).collection(menu).remove({})
      for (let i = 0, len = menus.length; i < len; i++) {
        const createTime = new Date().getTime()
        const params = Object.assign(menus[i], {
          id: uuidV1().replace(/\-/g, ''),
          createTime: createTime,
          updateTime: createTime
        })
        const res = await ctx.mongo.db(conf.mongodb.db).collection(menu).insert(params)
        if (res && res.result.ok === 1) {
          util.success(ctx, res.ops)
        } else {
          util.fail(ctx, 1005)
        }
      }
    } else if (menus.length === 0) {
      await ctx.mongo.db(conf.mongodb.db).collection(menu).remove({})
      util.success(ctx)
    } else {
      util.fail(ctx, 1004)
    }
  },

  addDev: async (ctx) => {
    // 添加单个项目id
    const { itemId, dev, menuId } = ctx.request.query

    if (!itemId || !dev || !menuId) {
      util.fail(ctx, 1006)
      return
    }
    // 查找菜单
    const menu = await ctx.mongo.db(conf.mongodb.db).collection('menu').findOne({ id: menuId })
    const params = {}
    // 是否已经存在了此项目的id号
    if (menu[dev].indexOf(itemId) >= 0) {
      util.fail(ctx, 20010)
    } else{
      params[dev] = menu[dev]
      params[dev].push(parseInt(itemId)) // 保存的都是数字 否则在删除项目，在关联menu的dev 和 user的dev，就找不到对应id

      // 更新数据
      const data = await ctx.mongo.db(conf.mongodb.db).collection('menu').update({ id: menuId }, { $set: params })
      if (data.result.ok === 1) {
        util.success(ctx)
      } else {
        util.fail(ctx, 1005)
      }
    }
  }
}
