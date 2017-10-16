const ip = require('ip').address()
const dev = process.env.DEV === 'dev' ? true : false
const port = 3001
const nginx = 3000
const staticUrl = `//${ip}:${nginx}/dist/`

const config = {
    render: {
        id: '',
        name: '',
        test: [],
        beta: [],
        prod: [],
    },
    domain: {
        dev: '',
        siteUrl: `//${ip}:${port}/`,
        staticUrl,
        error: ''
    },
    // 端口号
    port,
    mongodb: {
        host: '127.0.0.1', //
        port: 27017, //
        db: 'feRelease',
        user: 'iwjw',
        password: 'iwjw123'
    },
    mysql_test: {
        connectionLimit: 50,
        dateStrings: true,
        host: 'db.iwjwtest.com',
        port: '3306',
        user: 'root',
        password: 'QA@2015',
        database: 'hims_test'
    },
    mysql_beta: {
        connectionLimit: 50,
        dateStrings: true,
        host: '121.40.127.92', // 10.171.251.52
        port: '3309',
        user: 'serverdev',
        password: 'xue^#l]ut*',
        database: 'hims_beta'
    },
    // mysql_prod: {
    //   connectionLimit: 50,
    //   dateStrings: true,
    //   host     : '121.40.127.92',
    //   port     : '3306',
    //   user     : 'serverdev',
    //   password : 'xue^#l]ut*',
    //   database : 'hims_beta'
    // },
    compress: {
        filter: function(content_type) { // 配置过滤的压缩文件的类型
            return /text/i.test(content_type)
        },
        threshold: 2048, // 要压缩的最小响应字节
        flush: require('zlib').Z_SYNC_FLUSH // 同步的刷新缓冲区数据；
    },
    cdn: [{
        key: 1,
        val: 'files.iwjw.com'
    }, {
        key: 2,
        val: 'files.fyb365.com'
    }, {
        key: 3,
        val: 'resource.iwjw.com'
    }],

    bucket_test: [{
        bucket: 'house-test-water',
        folder: 'resource/'
    }, {
        bucket: 'house-test-water',
        folder: 'resource/'
    }, {
        bucket: 'house-test-water',
        folder: 'resource/'
    }],

    bucket_beta: [{
        bucket: 'house-test-water',
        folder: 'resource/'
    }, {
        bucket: 'house-test-water',
        folder: 'resource/'
    }, {
        bucket: 'house-test-water',
        folder: 'resource/'
    }],

    bucket_prod: [{
        bucket: 'house-images-water',
        folder: 'resource/'
    }, {
        bucket: 'house-images-water',
        folder: 'resource/'
    }, {
        bucket: 'iwjw-resource',
        folder: ''
    }],
    staticUrl: `http://10.7.250.83:${port}/uploadStatic`, // 静态上传服务器地址
    // staticUrl: `http://${ip}:${port}/uploadStatic`,
    staticKey: 'iwjw-fe-release',
    staticDirectory: { // 静态上传配置
        dest: './dist',
        fnDestFilename: (fieldname, filename) => {
            return fieldname + filename
        }
    },
    staticConf: 'http://house-test-water.oss.aliyuncs.com/resource/'
}

module.exports = config
