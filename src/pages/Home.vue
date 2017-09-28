<template>
  <div class="container">
    <router-view></router-view>
    <div class="fixed_top">
      <span class="btn"><i ref="notice" class="iconfont icon-message01" @click="openMessage" style="font-size: 22px;"></i></span>
      <span ref="user" class="btn" style="position: relative;" @click="$router.push({ name: 'star' })">
        <img :src="img"><i class="userIcon">{{ star.length }}</i>
      </span>
      <span class="btn open_profile" @click="setChildrenProfile"></span>
    </div>
    <pro-file :img="img" ref="profile"></pro-file>
    <side-bar :star="star"></side-bar>
    <div class="mask" :class="[mask ? 'active': '']"></div>
    <item-create :state="stateCreate"></item-create>
    <item-upload @logger="setLogger" ref="upload"></item-upload>
    <item-update ref="edititem" @show="editItem"></item-update>
    <message @notice="notice" ref="msg"></message>
  </div>
</template>

<script>
  require('../common/gotop')()
  require('../common/win.css')
  import SideBar from '@/SideBar'
  import ProFile from '@/ProFile'
  import Message from '@/Message'
  import ItemCreate from '@/ItemCreate'
  import ItemUpload from '@/ItemUpload'
  import ItemUpdate from '@/ItemUpdate'
  import { getData, getDev } from '../common/util'
  import { staticUrl } from '../api/mock-data'
  const dev = getDev()

  export default {
    data () {
      return {
        img: '', // 存储头像
        star: (window.config[dev] && window.config[dev].length && window.config[dev].split(',')) || [],
        mask: false, // 黑色遮罩显隐
        stateCreate: false
      }
    },
    components: {
      SideBar,
      ProFile,
      ItemCreate,
      ItemUpload,
      ItemUpdate,
      Message
    },
    methods: {
      parentTargetUpload (item) {
        this.$refs.upload.setState(true, item)
      },
      setChildrenProfile (state) {
        this.$refs.profile.setState(state)
      },
      openCreate (state) {
        this.mask = state
        this.stateCreate = state
      },
      setStar (itemid) {
        this.$refs.user.classList.add('zboing')
        this.$refs.user.addEventListener('webkitAnimationEnd', () => {
          this.$refs.user.classList.remove('zboing')
        })
        if (itemid) itemid = itemid.toString()
        if (itemid) {
          const i = this.star.indexOf(itemid)
          i >= 0 ? this.star.splice(i, 1) : this.star.push(itemid)
        } else {
          this.star = []
        }
        window.config.star = this.star
      },
      setImg (img) {
        this.img = img
      },
      editItem (state, item) {
        this.$refs.edititem.setItem(state, item)
        this.mask = state
      },
      setLogger (item) {
        this.$refs.profile.setLogger(item)
      },
      openMessage () {
        this.$refs.msg.show(() => {
          this.$refs.notice.classList.remove('active')
        })
      },
      notice () {
        this.$refs.notice.classList.add('active')
      }
    },
    beforeRouteLeave (to, from, next) {
      const theme = getData('theme')
      if (theme === 'dark') {
        document.body.classList.remove(theme)
      }
      next()
    }
  }
</script>

<style>
.container { margin-bottom: 20px; }
#gotop {
  position: fixed;
  right: 20px;
  bottom: 30px;
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  cursor: pointer;
  font-size: 16px;
  color: #fff;
  background: #ccc;
  transition: transform .3s ease-out;
  transform: translateY(100px);
}
#gotop.active {
  transform: translateY(0);
}
.mask {
  position: fixed;
  left: 0;
  top: -100%;
  width: 100%;
  height: 100%;
  background: #000;
  opacity: 0;
  transition: opacity .1s ease-out;
}
.mask.active { top: 0; opacity: .3;z-index: 1002;}
.fixed_top {
  height: 30px;
  display: inline-flex;
  align-items: center;
  position: fixed;
  right: 20px;
  top: 20px;
}
.fixed_top .btn {
  flex: 1 1 0;
  opacity: .6;
  color: #aaa;
  cursor: pointer;
  margin-left: 6px;
}
.fixed_top .open_profile {
  width: 30px;
  height: 30px;
  background-size: auto 17px;
  background-image: url(data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNyAxNyI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiM2ODY4Njg7ZmlsbC1ydWxlOmV2ZW5vZGQ7fTwvc3R5bGU+PC9kZWZzPjx0aXRsZT5pY29uX21lbnU8L3RpdGxlPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTAsM0gzVjBIMFYzWk03LDNoM1YwSDdWM1ptNy0zVjNoM1YwSDE0Wk0wLDEwSDNWN0gwdjNabTcsMGgzVjdIN3YzWm03LDBoM1Y3SDE0djNaTTAsMTdIM1YxNEgwdjNabTcsMGgzVjE0SDd2M1ptNywwaDNWMTRIMTR2M1oiLz48L3N2Zz4=);
  background-repeat: no-repeat;
  background-position: center center;
}
.fixed_top .userIcon {
  display: block;
  position: absolute;
  top: -8px;
  right: -2px;
  height: 14px;
  line-height: 14px;
  padding: 1px 2px;
  font-size: 10px;
  font-style: normal;
  border-radius: 1px;
  color: #888;
  background: #fff;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}
.fixed_top img { width: 22px; height: 22px; border-radius: 50%; }
.fixed_top .btn:hover { opacity: 1; }
</style>
