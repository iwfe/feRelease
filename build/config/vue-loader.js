var utils = require('../utils')
var isProduction = process.env.NODE_ENV === 'production'

const config = utils.cssLoaders({
  sourceMap: isProduction ? false : true,
  extract: isProduction
})

module.exports = {
  loaders: config
}
