<template>
  <div id="message" :class="{ 'active': state }">
    <ul id="message_list" @click="privateLetter" ref="list"></ul>
    <div class="form">
      <input ref="input" class="input" @input="changeText" @keyup.enter="sendText" autocomplete="off" />
      <button ref="send" class="send" type="button" @click="sendText">发送</button>
    </div>
    <b @click="state=false" style="position: absolute;right: 6px;top: 0px;font-size: 22px;cursor: pointer;color: #fff;">&times;</b>
  </div>
</template>

<script>
const socket = io('/')
const getCurrentTime = () => new Date().toLocaleTimeString()
const appendMessage = (message, type, content, lock) => {
  const list = document.querySelector('#message_list')
  if (lock) {
    const msg = document.querySelector('#message')
    const user = '<div class="title">' + content + '</div>'
    msg.insertAdjacentHTML('afterbegin', user)
  } else {
    const li = '<li> <span class="msg-' + type + '">' + content + '</span></li>'
    message.insertAdjacentHTML('beforeend', li)
  }
}

export default {
  data () {
    return {
      state: false
    }
  },
  mounted () {
    const btn = this.$refs.send
    const input = this.$refs.input
    const list = this.$refs.list

    socket.on('error', (err) => { appendMessage(list, 'error', err) })
    socket.on('connect', () => { console.log('链接成功') })
    socket.on('disconnect', () => { appendMessage(list, 'error', '连接已断开！') })
    socket.on('chat message', (msg) => {
      if (typeof msg === 'string') {
        appendMessage(list, 'message', msg, true)
      } else {
        if (msg.from === window.config.name) {
          // 自己@谁依然可以判断
          appendMessage(list, 'message', '<span class="user_me">我</span><span class="content" style="background: #AED581;color: #333;">' + msg.content + '</span>')
        } else if (msg.privateLetter) {
          appendMessage(list, 'message', '<span class="user">' + msg.from + '</span><span class="content" style="background: #EA80FC;color: #fff;">' + msg.content + '</span>')
          this.$emit('notice', this.state)
        } else {
          appendMessage(list, 'message', '<span class="user">' + msg.from + '</span><span class="content">' + msg.content + '</span>')
          this.$emit('notice', this.state)
        }
        list.scrollTop = list.scrollHeight
      }
    })
    socket.emit('chat message', window.config.id)
  },

  methods: {
    show () {
      this.state = !this.state
      this.$emit('notice', this.state)
    },
    addUser (e) {
      const tar = e.target
      if (tar.className === 'user') {
        input.value = '@' + tar.value
      }
    },
    changeText (e) {
      const val = e.target.value.replace(/\s/g, '')
      if (val.length) {
        this.$refs.send.classList.add('active')
      } else {
        this.$refs.send.classList.remove('active')
      }
    },
    sendText (e) {
      // 用户名只可以是数字英文_
      // const code = e.charCode || e.keyCode || e.which
      const val = this.$refs.input.value.replace(/\s/g, '')
      // if (code === 13 || code === 1 && val.length) {
      // }
      if (val.length) {
        socket.emit('chat message', val)
        this.$refs.input.value = ''
        this.$refs.send.classList.remove('active')
      }
    },
    privateLetter (e) {
      const cla = e.target.className
      if (cla === 'user') {
        this.$refs.input.value = '"@' + e.target.innerHTML + '":'
        this.$refs.input.focus()
      }
    }
  }
}
</script>

<style>
  #message {
    position: fixed;
    right: 10px;
    bottom: 10px;
    overflow: hidden;
    width: calc(100vw - 70vw);
    background: #F0F0F0;
    border-radius: 3px;
    transition: all .25s;
    transform: scale(0);
    transform-origin: right bottom;
  }
  #message .form {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    padding: 6px;
  }
  #message .input {
    flex: 1 1 auto;
    height: 32px;
    padding: 0 6px;
    margin-right: 6px;
    border: 1px solid #ddd;
    background: #fff;
    border-radius: 3px;
    font-size: 14px;
  }
  #message .send {
    width: 60px;
    height: 32px;
    font-size: 14px;
    color: #aaa;
    border: 1px solid #ccc;
    background: #ddd;
    outline: none;
    border-radius: 3px;
    transition: all .25s;
  }
  #message .send.active {
    cursor: pointer;
    color: #666;
  }
  #message ul {
    overflow-y: auto;
    max-height: 240px;
    min-height: 180px;
  }
  #message ul::-webkit-scrollbar {
    width: 0;
  }
  #message li {
    text-indent: 12px;
    height: 30px;
    line-height: 30px;
    padding: 4px 0;
  }
  #message.active {
    transform: scale(1);
  }
  #message .user {
    padding-right: 6px;
    color: #00C652;
  }
  #message .user_me {
    padding-right: 6px;
    color: #666;
  }
  #message .content {
    padding: 6px;
    border-radius: 5px;
    color: #666;
    background: #fff;
    border: 1px solid #ddd;
  }
  #message .title {
    height: 36px;
    line-height: 36px;
    padding-left: 12px;
    background: #666;
    color: #fff;
    margin-bottom: 6px;
  }
</style>
