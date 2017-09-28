const util = require('../util')
const conf = require('../config')
const mysql = require('../util/mysql')

module.exports = {
  async post (ctx) {
    const { dev, name, userid, version } = ctx.request.body

    if (!dev || !name || !version) {
      util.fail(ctx, 1006)
      return
    }

    if (!util.getDev(dev)) {
      util.fail(ctx, 1007)
      return
    }

    // const timer = util.getDateTime(new Date())
    const date = await mysql(dev, 'select now()')
    const timer = date[0]['now()'] // 创建时间
    await ctx.mongo.db(conf.mongodb.db).collection('logger').insert({ dev, name, version, userid, timer }).then((res) => {
      if (res.result.ok) {
        util.success(ctx, { timer })
      } else {
        util.fail(ctx, 1005)
      }
    })

  },

  async get (ctx) {
    const { userid, dev } = ctx.request.query
    const data = await ctx.mongo.db(conf.mongodb.db).collection('logger').find({ userid, dev }).limit(10).sort({ timer: -1 }).toArray()
    util.success(ctx, data)
  }
}
