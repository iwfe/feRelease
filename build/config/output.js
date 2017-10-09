const path = require('path')
const ip = require('ip').address()

module.exports = {
    path: path.join(__dirname, '../../dist/'), // 输出路径
    filename: '[name].js', // key
    chunkFilename: '[name].[chunkhash].js', // 针对异步文件 hash
    publicPath: `//${ip}:3000/dist/`
}