const ip = require('ip').address()

module.exports = {
    local: {
        publicPath: `//${ip}:3000/dist/`
    },
    test: {
        publicPath: `//10.7.250.83:3000/dist/`
    },
    beta: {
        publicPath: `//10.7.250.83:3000/dist/`
    },
    prod: {
        publicPath: `//10.7.250.83:3000/dist/`
    }
}