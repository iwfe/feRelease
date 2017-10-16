const fs = require('fs')
const path = require('path')
const conf = require('../config')
const msg = require('../config/msg')
const cj = require("crypto-js")

const util = {
    async checkLogin (ctx, next) {
        const id = ctx.cookies.get('userid')
        if (!id) {
            ctx.type = 'text/html; charset=utf-8'
            ctx.redirect('/signin')
        } else {
            const _user = await ctx.mongo.db(conf.mongodb.db).collection('user').findOne({ id })
            if (_user) {
                // 更新cookie的时间 ?
                await next()
            } else {
                ctx.redirect('/signin')
            }
        }
    },
    async getUser (ctx, next) {
        const id = ctx.cookies.get('userid')
        const user = await ctx.mongo.db(conf.mongodb.db).collection('user').findOne({ id })
        if (user) {
            delete user._id
            delete user.pwd
            ctx._user = user
            await next()
        } else {
            ctx.redirect('/signin')
        }
    },
    async engine (ctx, next) {
        await next()
        ctx.set('X-Powered-By', 'Koa2')
    },
    async render (ctx) {
        // const d = fs.readFileSync(path.resolve(__dirname, '../config/version.json'), 'utf8')
        // const version = '_' + JSON.parse(d).version
        if (ctx.query.dev) conf.domain.dev = ctx.query.dev
        const obj = Object.assign({}, conf.render, ctx._user, conf.domain)
        return ctx.render('index', obj)
    },
    logger (ctx, next) {
        const start = new Date()
        return next().then(() => {
            const ms = new Date() - start
            // console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
        })
    },
    error (err, ctx) {
        console.error('server error', err, ctx)
    },
    success (ctx, data, msg = 'ok') {
        ctx.body = {
            status: 1,
            data,
            msg
        }
    },
    fail (ctx, code) {
        const str = typeof code === 'number' ? msg[code] : code
        ctx.body = {
            status: -1,
            msg: str,
            code
        }
    },
    // test (ctx) {
    //   const readStream = fs.createReadStream('./dist' + ctx.path)
    //   ctx.body = readStream
    // },
    forEach (obj, cb) {
        if (!obj || typeof obj === 'undefined') return
        if (typeof obj !== 'object' && Array.isArray(obj)) obj = [obj]
        if (Array.isArray(obj)) {
            for (let i = 0, len = obj.length; i < len; i++) {
                cb(obj[i], i, obj)
            }
        } else {
            for (let key in obj) {
                cb(obj[key], key, obj)
            }
        }
    },
    async (ms) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(true)
            }, ms)
        })
    },
    encrypt (code) {
        return cj.AES.encrypt(JSON.stringify(code), conf.staticKey).toString()
    },
    decode (code) {
        const text = cj.AES.decrypt(code.toString(), conf.staticKey)
        return JSON.parse(text.toString(cj.enc.Utf8))
    },
    md5 (code) {
        return cj.MD5(code).toString()
    },
    getDev(dev) {
        return ['test', 'beta'].indexOf(dev) >= 0 // prod
    },
    addVersion (str, version) {
        if (!str) return
        return str.replace(/(.[\w]+$)/, (res) => {
            return '_' + version + res
        })
    },
    getDateTime (date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hh = date.getHours();
        const mm = date.getMinutes();
        const ss = date.getSeconds();
        return year + "-" + month + "-" + day + " " + hh + ":" + mm + ":" + ss;
    }
}

module.exports = util