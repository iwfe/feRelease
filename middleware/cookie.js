// const crypto = require("crypto")

// const encrypt = function(val, key, method = "aes192") {
//   let cipher = crypto.createCipher(method, key)
//   cipher.update(val, "utf8", "hex")
//   return cipher.final("hex")
// }

// const decrypt = function(val, key, method = "aes192") {
//   let deCipher = crypto.createDeCipher(method, key)
//   deCipher.update(val, "hex", "utf8")
//   return cipher.final("utf8")
// }

// module.exports = function(key, method = "aes192") {
//   return co.wrap(function*(ctx, next) {
    // const originalSet = ctx.cookies.set.bind(ctx.cookies)
    // const originalGet = ctx.cookies.get.bind(ctx.cookies)
    // //重新定义cookies.set具备加密功能:
    // ctx.cookies.set = function(...args) {
    //   try {
    //     args[1] = encrypt(args[1], key, method)
    //     originalSet(...args)
    //   } catch (e) {
    //     console.log(e)
    //   }
    // }
    // //重新定义cookies.get具备解密功能:
    // ctx.cookies.get = function(...args) {
    //   try {
    //     args[1] = decrypt(args[1], key, method)
    //     originalGet(...args)
    //   } catch (e) {
    //     console.log(e)
    //   }
    // }
    //增加一个清除cookie的功能：
//     ctx.cookies.clear = function(name) {
//       if (!name) return
//       let d = new Date()
//       d.setTime(d.getTime() - 1)
//       ctx.cookies.set(name, " ", { expires: d })
//     }
//     yield next() //最后别忘了yield next;
//   })
// }

module.exports = {

}

