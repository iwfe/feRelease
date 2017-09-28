const util = require('../util')
const msg = require('../config/msg')
const uuidV1 = require('uuid/v1')
const conf = require('../config')

module.exports = {

  signout (ctx) {
    let d = new Date()
    d.setTime(d.getTime() - 1)
    ctx.cookies.set('userid', '', { expires: d })
    util.success(ctx)
  },

  async signin (ctx) {
    const { name, pwd, dev } = ctx.request.body
    if (name && pwd) {
      const _pwd = util.md5(pwd)
      const _name = await ctx.mongo.db(conf.mongodb.db).collection('user').findOne({ name, pwd: _pwd })

      if (!_name) {
        ctx._user = { error: msg[10004] }
        await util.render(ctx)
      } else {
        const _user = await ctx.mongo.db(conf.mongodb.db).collection('user').findOne({ name, pwd: _pwd })

        if (!_user) {
          ctx._user = { error: msg[10005] }
          await util.render(ctx)
        } else {
          await ctx.cookies.set('userid', _user.id, {
            // signed // 是否要做签名
            // domain: 'localhost',  // 写cookie所在的域名
            path: '/',       // 写cookie所在的路径
            // maxAge: 100000,
            maxAge: 100 * 60 * 1000 * 12, // cookie有效时长
            // expires: new Date('2017-02-15'),  // cookie失效时间
            secure: false, // 表示 cookie 通过 HTTP 协议发送，true 表示 cookie 通过 HTTPS 发送
            httpOnly: true,  // 是否只用于http请求中获取 true不允许客户端获取
            overwrite: true  // 是否允许重写 false不允许
          })

          if (util.getDev(dev)) {
            conf.render.dev = dev
          }
          ctx.redirect('/?dev=' + dev)
        }
      }
    } else {
      ctx._user = { error: msg[10006] }
      await util.render(ctx)
    }
  },

  async signup (ctx) {
    const { name, pwd } = ctx.request.body

    // 效验字符
    // ...
    if (name && pwd) {
      const people = await ctx.mongo.db(conf.mongodb.db).collection('user').findOne({ name })
      if (people) {
        util.fail(ctx, 10002)
      } else {
        const _pwd = util.md5(pwd)
        const params = Object.assign({}, conf.render, {
          id: uuidV1().replace(/\-/g, ''),
          pwd: _pwd,
          name,
        })
        await ctx.mongo.db(conf.mongodb.db).collection('user').insert(params).then((res) => {
          if (res.result.ok === 1) {
            util.success(ctx)
          } else {
            util.fail(ctx, 1005)
          }
        })
      }
    } else {
      util.fail(ctx, 10006)
    }
  },

  async patch (ctx) {
    const { id, itemId, state, dev } = ctx.request.body

    if (!util.getDev(dev)) {
      util.fail(ctx, 1003)
      return
    }
    const _user = await ctx.mongo.db(conf.mongodb.db).collection('user').findOne({ id })
    if (!_user[dev]) _user[dev] = []
    if (_user) {
      const i = _user[dev].indexOf(itemId)
      const obj = {}
      obj[dev] = [] // delall
      switch (state) {
        case 'add':
          if (i <= -1 && itemId) {
            _user[dev].unshift(itemId) // 添加星级项目
            obj[dev] = _user[dev]
          } else {
            util.fail(ctx, 20005)
            return
          }
          break

        case 'del':
          if (i >= 0) {
            _user[dev].splice(i, 1)
            obj[dev] = _user[dev]
          }
          break

        case 'delAll':
          break
      }
      await ctx.mongo.db(conf.mongodb.db).collection('user').update({ id }, { $set: obj })
      util.success(ctx)
    } else {
      util.fail(ctx, 10004)
    }
  }

}
