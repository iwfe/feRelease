const socker = require('socket.io')
const db = require('../util/mongodb')
const path = require('path')
const user = {}

module.exports = (app) => {
  const io = socker(app)

  io.on('connection', (socket) => {
    socket.on('disconnect', function() {
      console.log('user disconnected')
    })

    socket.on('chat message', async (msg) => {
      console.log(msg)
      if (!socket.name) {
        const data = await db.find({ id: msg })
        socket.name = data[0].name
        socket.emit('chat message', '欢迎光临 ' + socket.name)
        user[socket.name] = socket
      } else {
        const name = msg.match(/@\w+|:$/g) // 取用户名
        if (name && name.length) {
          const uname = name[0].replace('@', '')
          const text = msg.replace(/^"@\w+":/, '')
          const _socket = user[uname]

          if (_socket) {
            _socket.emit('chat message', { from: socket.name, content: text, privateLetter: true })
            socket.emit('chat message', { from: socket.name, content: text, privateLetter: true })
          } else {
            socket.emit('chat message', { from: '系统', content: '『' + to + '』好像不在……' })
          }
        } else {
          io.emit('chat message', { from: socket.name, content: msg })
        }
      }
    })
  })
}