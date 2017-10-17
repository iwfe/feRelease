const conf = require('../config')
const util = require('../util')
const msg = require('../config/msg')
const mysql = require('../util/mysql')
const uuidV1 = require('uuid/v1')

module.exports = {

  async createItem (ctx) {
    let { name, folderName, memo, ossType, dev } = ctx.request.body
    if (!memo) memo = ''
    // 效验字段缺失否
    if (!name || !folderName || !ossType || !dev) {
      util.fail(ctx, 1006)
      return
    }
    // 效验环境
    if (!util.getDev(dev)) {
      util.fail(ctx, 1007)
      return
    }

    // 暂不验证字符合法性

    // 静态数据
    const date = await mysql(dev, 'select now()')
    const createTime = date[0]['now()'] // 创建时间
    const updateTime = date[0]['now()'] // 更新时间
    const propertiesPath = ''
    const onoffPath = ''
    // propertiesPath: conf.getUrl(folderName, dev, 'properties'), // 映射文件oss路径
    // onoffPath: conf.getUrl(folderName, dev, 'onoff'), // 是否自动更新资源开关文件
    const onoff = 0 // 自动更新开关 0-关闭 1-开启
    const versionType = 0 // 版本管理方式0-自动管理；1-手动管理
    const isDelete = 0 // 是否删除 0正常, 1删除
    const version = 0 // 版本号
    const parentId = 0 // 上级项目ID

    // 验证 name 唯一性
    const arr = await mysql(dev, 'select * from iw_static_project where name="' + name + '" and isDelete=0') // 等于1 的不在去处理了
    if (arr && arr.length >= 1) {
      util.fail(ctx, 20007)
      return
    }

    // 验证 folderName 唯一性
    const arr2 = await mysql(dev, 'select * from iw_static_project where folderName="' + folderName + '" and isDelete=0')
    if (arr2 && arr2.length >= 1) {
      util.fail(ctx, 20008)
      return
    }

    // 最大 id
    // const count = await mysql(dev, 'select max(id) from iw_static_project')
    // const id = count[0]['max(id)'] + 1
    const insert = 'INSERT INTO iw_static_project (name,folderName,memo,ossType,createTime,updateTime,propertiesPath,onoffPath,onoff,versionType,isDelete,version,parentId) VALUES ("'+name+'","'+folderName+'","'+memo+'","'+ossType+'","'+createTime+'","'+updateTime+'","'+propertiesPath+'","'+onoffPath+'","'+onoff+'","'+versionType+'","'+isDelete+'","'+version+'","'+parentId+'")'
    const lock = await mysql(dev, insert)
    const data = await mysql(dev, 'select * from iw_static_project where folderName="' + folderName + '"')
    util.success(ctx, data)
  },

  //删除 item
  async delItem (ctx) {
    const { id, dev, userId } = ctx.request.query // id 是项目id
    // 效验
    if (!id) {
      util.fail(ctx, 20003)
      return
    }
    if (!dev) {
      util.fail(ctx, 1009)
      return
    }
    if (!userId) {
      util.fail(ctx, 10007)
      return
    }
    if (!util.getDev(dev)) {
      util.fail(ctx, 1007)
      return
    }
    // 正则效验
    // ...

    // 更新 menu dev 存储的项目id
    const menu = await ctx.mongo.db(conf.mongodb.db).collection('menu').find({}).toArray()
    for (let i = 0,len = menu.length; i < len; i++) {
      if (menu[i][dev].length >= 1) {
        const n = menu[i][dev].indexOf(id)
        if (n >= 0) {
          const params = {}
          menu[i][dev].splice(n, 1)
          params[dev] = menu[i][dev]
          await ctx.mongo.db(conf.mongodb.db).collection('menu').update({ id: menu[i].id }, { $set: params })
        }
      }
    }

    // 更新用户关注
    const user = await ctx.mongo.db(conf.mongodb.db).collection('user').findOne({ id: userId })
    if (user[dev].length >= 1) {
      const n = user[dev].indexOf(id)
      if (n >= 0) {
        const params = {}
        user[dev].splice(n, 1)
        params[dev] = user[dev]
        await ctx.mongo.db(conf.mongodb.db).collection('menu').update({ id: menu[i].id }, { $set: params })
      }
    }

    await mysql(dev, 'delete from iw_static_project where id=' + id)
    // const data = await mysql(dev, 'update iw_static_project set isDelete=1 where id=' + id) // 0 正常, 1 删除
    // 手动删除oss 下的文件了
    util.success(ctx, data)
  },

  // 更新 item
  async updateItem (ctx) {
    let { name, folderName, memo, dev, id } = ctx.request.body
    if (!memo) memo = ''

    if (name && folderName && dev && id) { // 必须都传

      // item 必须存在
      const item = await mysql(dev, 'SELECT * FROM iw_static_project WHERE id=' + id)
      if (!item) {
        util.fail(ctx, 20009)
        return
      }

      // 验证 name
      const item_name = await mysql(dev, 'SELECT * FROM iw_static_project WHERE isDelete=0 and name="' + name + '"')
      if (item_name.length >= 2) {// 提交的 name 不会存在两个以上
        util.fail(ctx, 20007)
        return
      }
      if (item_name.length === 1 && item_name[0].id !== item[0].id) { // 存在一个 name 相同的，但是 != 当前更改的 item
        util.fail(ctx, 20007)
        return
      }

      // 验证 folderName
      const item_folder = await mysql(dev, 'SELECT * FROM iw_static_project WHERE isDelete=0 and folderName="' + folderName + '"')
      if (item_folder.length >= 2) {
        util.fail(ctx, 20008)
        return
      }
      if (item_folder.length === 1 && item_folder[0].id !== item[0].id) {
        util.fail(ctx, 20008)
        return
      }

      // update item
      const data = await mysql(dev, 'update iw_static_project set name="' + name +'",folderName="' + folderName + '",memo="' + memo + '", where id=' + id + '')
      util.success(ctx, data)

    } else {
      util.fail(ctx, 1006)
      return
    }

  },

  async getItemStar (ctx) {
    const { itemId, dev } = ctx.request.body
    if (!dev) {
      util.fail(ctx, 1009)
      return
    }
    if (!itemId) {
      util.fail(ctx, 1003)
      return
    }
    if (!itemId || !util.getDev(dev)) {
      util.fail(ctx, 1007)
    } else {
      const data = await mysql(dev, 'SELECT * FROM iw_static_project WHERE id in (' + itemId.toString() + ') and isDelete=0')
      util.success(ctx, data)
    }
  },

  async getItemAll (ctx) {
    const dev = ctx.request.query.dev
    if (!util.getDev(dev)) {
      util.fail(ctx, 1003)
    } else {
      const data = await mysql(dev, 'SELECT * FROM iw_static_project WHERE isDelete=0 ')
      util.success(ctx, data)
    }
    // const data = await ctx.myPool().query('SELECT * FROM iw_static_project')
    // const arr = []
    // for (let i = 0, len = data.length; i < len; i++) {
    //   if (data[i].isDelete === 0) {
    //     arr.push(data[i])
    //   }
    // }
    // util.success(ctx, arr)
  },

  async getItemRecent (ctx) {
    const dev = ctx.request.query.dev
    if (!util.getDev(dev)) {
      util.fail(ctx, 1003)
    } else {
      const data = await mysql(dev, 'select * from iw_static_project order by updateTime desc limit 9')
      util.success(ctx, data)
    }
  }
}

// SELECT * FROM iw_static_project where DATE_SUB(CURDATE(), INTERVAL 7 DAY) <= date(updateTime)
