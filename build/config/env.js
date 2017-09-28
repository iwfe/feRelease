const ip = require('ip').address()

module.exports = {
    local: {
        publicPath: `//${ip}:3000/dist/`
    },
    test: {
        publicPath: `//${ip}:3000/dist/`
    },
    beta: {
        publicPath: `//${ip}:3000/dist/`
    },
    prod: {
        publicPath: `//${ip}:3000/dist/`
    }
}