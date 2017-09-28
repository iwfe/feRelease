<template>
<div class="profile" :class="{ 'profile_active': profile }">
  <div class="user">
    <div class="info">
      <vue-core-image-upload
        :crop-ratio="`${this.cropW}:${this.cropH}`"
        class="avatar"
        :crop="false"
        url="/uploadimg"
        extensions="png,jpeg,jpg"
        @imagechanged="imagechanged"
        @imageuploading="imageuploading"
        @imageuploaded="imageuploaded">
        <img :src="img" @click="show=true" />
      </vue-core-image-upload>
      <div class="username">{{ name }}</div>
      <span class="source">登录源于</span>
    </div>
    <a class="logout" @click="signout">注销</a>
  </div>

  <div class="theme_toggle">
    主题
    <div class="theme" @click="theme">
      <span class="dark"></span>
      <span class="light"></span>
    </div>
  </div>
  <div class="layout">
    <div v-if="logger.length">最近上传</div>
      <div class="flex" v-for="v in logger">
        <span>{{ v.name }}</span>
        <span>{{ v.version }}</span>
        <span>{{ v.timer }}</span>
      </div>
      <div v-if="logger.length === 0">暂无上传记录</div>
    </div>
  </div>

</div>
</template>

<script>
import VueCoreImageUpload from 'vue-core-image-upload'
import { setProfile, getDev } from '../common/util'
import { axios } from '../api'
import img from '../api/me_default.jpg'

export default {
  data () {
    return {
      src: 'http://img1.vued.vanthink.cn/vued0a233185b6027244f9d43e653227439a.png',
      cropW: 1,
      cropH: 1,
      img: (window.config && window.config.img) || img,
      name: (window.config && window.config.name) || '',
      profile: false,
      logger: [],
      lock: true
    }
  },
  components: {
    VueCoreImageUpload
  },
  created () {
    this.$parent.setImg(this.img)
  },
  methods: {
    setState (state) {
      if (this.lock) {
        axios('log', 'get', { dev: getDev(), userid: window.config.id })
        .then((res) => {
          this.lock = false
          if (res) this.logger = this.logger.concat(res)
        })
      }
      this.profile = state
      document.addEventListener('click', setProfile.bind(this, () => {
        this.profile = false
      }))
    },
    theme (e) {
      const theme = e.target.className
      document.body.className = theme
      localStorage.setItem('theme', theme)
    },
    uploadImgSuccess (e) {
      alert(e)
    },
    imagechanged () {
      alert('222')
    },
    imageuploading () {
      document.title = '2'
    },
    imageuploaded (res) {
      this.img = res.url
      this.$parent.setImg(this.img)
    },
    signout () {
      axios('signout', 'post').then((res) => {
        this.$router.push({ name: 'signin' })
      })
    },
    setLogger (item) {
      this.logger.unshift(item)
    }
  }
}
</script>

<style>
.profile {
  position: fixed;
  right: 0;
  top: 0;
  width: 375px;
  height: 100%;
  padding: 15px 0px;
  background: #fff;
  font-size: 12px;
  transform: translateX(375px);
  transition: transform .2s;
  box-shadow: -3px 0 20px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
  z-index: 1002;
}
.profile::-webkit-scrollbar { width: 0;}
.profile .user {
  border-bottom: solid 1px #e8eef6;
  text-transform: none;
  height: 30px;
  font-weight: 600;
  padding: 0 30px;
  padding-bottom: 20px;
}
.profile .info {
  float: left;
  width: 130px;
}
.profile .avatar {
  float: left;
  overflow: hidden;
  position: relative;
  vertical-align: middle;
  width: 22px;
  height: 22px;
  margin-top: 8px;
  margin-right: 10px;
  border-radius: 50%;
}
.profile .avatar img {
  width: 100%;
  height: 100%;
}
.profile .username {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: rgba(24, 25, 27, 0.7);
}
.profile .source {
  color: #666;
}
.profile .logout {
  float: right;
  width: 92px;
  height: 24px;
  line-height: 24px;
  margin-top: 3px;
  margin-right: 13px;
  text-align: center;
  border: solid 1px #e6e6e6;
  border-radius: 2px;
  cursor: pointer;
}
.profile .layout{
  padding: 15px 30px;
  border-top: solid 1px #e8eef6;
  overflow: hidden;
}
.profile .layout h5 {
  margin-bottom: 10px;
}
.profile .theme_toggle{
  padding: 20px 30px;
  height: 26px;
  line-height: 26px;
}
.profile .theme {
  float: right;
  margin-right: 14px;
}
.profile .theme span {
  float: right;
  width: 23px;
  height: 23px;
  margin-left: 5px;
  cursor: pointer;
  border: solid 1px #C2C2C2;
  border-radius: 13px;
}
.profile .theme .dark {
  background-color: #232129;
}
.profile_active {
  transform: translateX(0);
}
.upload {
  position: absolute;
  left: 50%;
  top: 50%;
  margin-top: -100px;
  margin-left: -100px;
  width: 200px;
  height: 200px;
  background: #fff;
  border: 1px solid #ddd;
}
.flex {
  display: flex;
  height: 30px;
  align-items: center;
}
.flex span {
  flex: 1;
  white-space: nowrap;
}
</style>
