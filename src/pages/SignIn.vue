<template>
  <div class="login">
    <video poster="" id="video" loop="" autoplay="" src="" class="hidden"></video>
    <audio src="" id="audio" style="display:none;" autoplay="" loop=""></audio>
    <div style="position: fixed;left: 16px;top:16px;"><b class="logo" style="opacity: .5;">iw</b><span style="flex: 1;padding-left: 12px;line-height: 36px;color: #fff;">static Releace</span></div>
    <div class="box" ref="box">
      <div class="a">
        <form id="signin" class="form" ref="signin" method="post" action="signin" v-on:submit.prevent="signin" autocomplete="off">
          <div class="start"><input-view :label-text="'请输入名称'" name="name" :value="name" :float-text="'用户名称'" :change="getName" /></div>
          <div class="start"><input-view :label-text="'请输入密码'" name="pwd"  :value="pwd" :float-text="'用户密码'" :change="getPwd" :event-enter="signin" type="password" /></div>
          <div class="start" style="margin-top: 32px;display: flex;">
            <label for="test" style="flex: 1;"><input id="test" type="radio" name="dev" value="test" v-model="dev">test</label>
            <label for="beta" style="flex: 1;"><input id="beta" type="radio" name="dev" value="beta" v-model="dev">beta</label>
            <!-- <label for="prod" style="flex: 1;"><input id="prod" type="radio" name="dev" value="prod" v-model="dev">prod</label> -->
          </div>
          <a class="btn" @click="signin">{{ lock ? '登录中' : '登录'}}</a>
        </form>
        <a class="forget" @click="tab">注册账号</a>
      </div>

      <div class="b">
        <div class="start"><input-view :label-text="'请输入名称'" name="name" :value="name2" :float-text="'用户名称'" :change="getName2" /></div>
        <div class="start"><input-view :label-text="'请输入密码'" name="pwd" :type="'password'" :value="pwd2" :float-text="'用户密码'" :change="getPwd2" /></div>
        <div class="start"><input-view :label-text="'请再次输入密码'" name="pwd" :type="'password'" :value="pwd22" :float-text="'确认密码'" :change="getPwd22" :event-enter="signup" /></div>
        <a class="btn" @click="signup">{{ lock ? '提交中' : '提交注册' }}</a>
        <a class="forget" @click="tab">登录 ></a>
      </div>

    </div>
  </div>
</template>

<script>
  import InputView from '../components/Input.vue'
  import { setData } from '../common/util'
  import { data } from '../api/mock-data'
  import { axios } from '../api'
  let current = -1

  export default {
    data () {
      return {
        dev: 'test',
        name: '',
        pwd: '',
        name2: '',
        pwd2: '',
        pwd22: '',
        lock: false,
        error: window.config.error || ''
      }
    },
    components: {
      InputView
    },
    created () {
      document.title = '静态发版'
      if (this.error) Toast.top(this.error)
    },
    mounted () {
      const d = parseInt(Math.random() * data.length)
      this.setScene(d, this.dev)
    },
    methods: {
      signin () {
        const name = this.name.replace(/\s/g, '')
        const pwd = this.pwd.replace(/\s/g, '')
        if (!name) {
          Toast.top('用户名为空')
          return
        }
        if (!pwd) {
          Toast.top('密码为空')
          return
        }
        if (this.lock) return
        if (name && pwd) {
          this.error = ''
          this.lock = true
          setData('dev', this.dev)
          this.$refs.signin.submit()
        }
      },
      signup () {
        const name = this.name2
        const pwd = this.pwd2

        if (!name) {
          Toast.top('请输入用户名')
          return
        }
        if (!pwd === this.pwd22) {
          Toast.top('两次密码不一致')
          return
        }
        if (!/^[a-z0-9_]+$/i.test(name)) {
          Toast.top('必须是数字或字母')
          return
        }
        if (!/^[a-z0-9_]+$/i.test(pwd)) {
          Toast.top('必须是数字或字母')
          return
        }
        if (this.lock) return
        this.lock = true
        this.error = ''

        const params = new URLSearchParams()
        params.append('name', name)
        params.append('pwd', pwd)

        axios('signup', 'post', params)
        .then((res) => {
          this.lock = false
          this.name = this.name2
          this.pwd = this.pwd2
          this.$refs.box.classList.remove('active')
        }).catch((res) => {
          this.lock = false
        })

      },
      setScene (index) {
        if (current == index) return
        current = index
        const d = data[index]
        document.getElementById("video").src = window.config.staticUrl.replace(/dist[/]/g, '') + d[0]
        document.getElementById("audio").src = window.config.staticUrl.replace(/dist[/]/g, '') + d[1]
        document.getElementById("video").poster = d[2]
      },
      getName (val) {
        this.name = val
      },
      getPwd (val) {
        this.pwd = val
      },
      getName2 (val) {
        this.name2 = val.replace(/\s/g, '')
      },
      getPwd2 (val) {
        this.pwd2 = val
      },
      getPwd22 (val) {
        this.pwd22 = val
      },
      tab () {
        this.$refs.box.classList.toggle('active')
      }
    }
  }
</script>

<style>
  body::-webkit-scrollbar {
    width: 0;
  }
  #video {position: fixed;width: 100%;right: 0;top: 0;}
  .login {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #fff;
  }
  .login .logo {font-size: 14px;}
  .box {
    position: relative;
    width: 240px;
    height: 350px;
    margin-top: -24px;
  }
  .login .a,.login .b {
    position: absolute;
    right: 0;
    top: 0;
    width: 100%;
    height: 100%;
    padding: 0 18px;
    transition: all .3s ease-in-out;
    backface-visibility: hidden;
    border: 1px solid rgba(255, 255, 255, .5);
    border-radius: 4px;
    background: rgba(000, 000, 000, .5);
  }
  .login .b {transform: rotateY(180deg);}
  .start { position: relative;font-size: 16px;}
  .input_text { border: 1px solid #ddd;border-radius: 3px; }
  .login .btn {
    position: absolute;
    right: 12px;
    left: 12px;
    bottom: 60px;
    display: block;
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    text-align: center;
    cursor: pointer;
    border: 1px solid #fff;
    border-radius: 3px;
    background: transparent;
    color: #fff;
  }
  .login .forget {position: absolute;bottom: 16px;right: 12px;cursor: pointer;}
  .box.active .a { transform: rotateY(180deg);}
  .box.active .b { transform: rotateY(0deg);}
</style>
