<template>
  <transition appear name="bounce">
    <nav id="sidebar">
        <header>
          <router-link :data-logo="current + '环境'"  :to="{name: 'recent'}" class="logo">iw</router-link>
          <a class="iconfont icon-tianjia win_tips_target" id="tips_icon-tianjia" data-tips="编辑菜单" @click="$router.push({name: 'all', query: { menu: $route.params.menu, dev: current }})"><b></b></a>
        </header>
      <ul class="sources" v-show="!lock">
        <li v-for="v in menu" @click="$router.push({ path: `/home/${v.path}` })" :class="{ 'active': v.path === menuactive.path, 'new': v.new }">
          <i class="icon" :class="v.ico">{{ v.des }}</i>
          <span class="name">{{ v.name }}</span>
        </li>
      </ul>

      <ul class="sources" v-show="lock">
        <li v-for="(v, i) in filtermenu" @click="filterMenu(v)">
          <b class="icon" :class="v.ico">{{ v.des }}</b>
          <span class="name">{{ v.name }}</span>
        </li>
      </ul>

      <div class="source_search" v-show="menu.length >= 1">
        <div class="search_container">
          <input type="text" ref="input" class="search_input" @input="searchMenu" placeholder="请输入菜单名称" />
        </div>
      </div>
    </nav>
  </transition>
</template>

<script>
  import { delay, forEach, getData, setData } from '../common/util'
  import { mapGetters } from 'vuex'
  import tips from '../common/tips'
  // http://www.cnblogs.com/rubylouvre/archive/2009/09/24/1572977.html

  export default {
    props: {
      star: {
        type: Array,
        default: [] // 用户关注的列表
      }
    },
    data () {
      return {
        current: this.$route.query.dev || getData('dev'),
        filtermenu: [], // 检索结果对象
        lock: false // 菜单列表的显隐
      }
    },
    computed: {
      ...mapGetters([
        'menu',
        'menuactive' // 当前选中的菜单
      ])
    },
    watch: {
      '$route' (to, from) {
        // console.log(to.name)
        this.menuHighlight()
      }
    },
    created () {
      this.menuHighlight()
    },
    mounted () {
      // tips('#tips_icon-tianjia')
    },
    methods: {
      /* 菜单点击事件 */
      menuHighlight () {
        const name = this.$route.name
        if (name === 'item') {
          let lock = false
          const path = this.$route.params.menu
          const menu = this.$store.state.menu
          // 只有all特殊处理
          if (path === 'all') {
            this.$store.dispatch('getItemAll')
            this.$store.dispatch('selectMenu', menu[0])
          } else {
            // 遍历菜单 path
            forEach(menu, (val, key, obj) => {
              if (val.path === path) {
                val.star = this.star
                lock = true
                if (val.new) {
                  delete val.new
                  setData('menu_data', this.menu.slice(1))
                }
                this.$store.dispatch('selectMenu', val)
              }
            })
            // 没有符合的path,则回到首页
            if (!lock) this.$router.push({ name: 'recent' })
          }
        }
        // 重置组件状态
        this.resetInput()
      },
      /* 检索当前菜单 */
      searchMenu (e) {
        const val = e.target.value.replace(/\s/g, '')
        delay(() => {
          if (val) {
            this.filtermenu = this.$store.state.menu.filter((v) => {
              return v.name.indexOf(val) >= 0
            })
            this.lock = true
          } else {
            this.filtermenu = []
            this.lock = false
          }
        }, 600)
      },
      /* 检索菜单点击事件 */
      filterMenu (v) {
        if (v.name === this.$store.state.menuactive.name) {
          this.resetInput()
        } else {
          this.$router.push({ path: `/home/${v.path}` })
        }
      },
      /* 重置状态 */
      resetInput () {
        this.lock = false
        this.filtermenu = []
        if (this.$refs.input) this.$refs.input.value = ''
      }
    }
  }
</script>

<style lang="less">
#sidebar{
  position: fixed;
  left: 0;
  top: 0;
  width: 65px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  font-size: 14px;
  will-change: opacity;
  transition: width .2s, opacity .2s, box-shadow .1s linear .1s;
  &:hover { width: 220px;box-shadow: 3px 0 20px rgba(0, 0, 0, 0.2); }
  &::-webkit-scrollbar { width: 0;}
  &:after {
    content: "";
    display: block;
    height: 80px;
  }
  .orange {
    color: #B27A1B;
    background: #F5CD13;
  }
  .blue {
    color: #fff;
    background: #099E01;
  }
  .purple {
    color: #fff;
    background: #874CFF;
  }
  .black { color: #fff; background: #000; }
  header {
    overflow: hidden;
    height: 60px;
    text-align: center;
    .logo {
      float: left;
      margin-left: 12px;
      margin-top: 12px;
    }
    .logo:after {
      position: absolute;
      left: 66px;
      top: 0;
      color: #999;
      line-height: 60px;
      content: attr(data-logo);
      opacity: 0;
      transition: opacity .2s;
    }
    .icon-tianjia {
      position: absolute;
      left: 200px;
      top: 16px;
      cursor: pointer;
      opacity: .6;
      -webkit-transition: opacity .4s;
    }
    .icon-tianjia:hover { opacity: 1; }
  }
  &:hover .logo:after {opacity: 1;}
  .sources{
    width: 260px;
    li {
      position: relative;
      display: block;
      height: 50px;
    }
    li.new:after {
      position: absolute;
      top: 8px;
      left: 17px;
      display: block;
      width: 6px;
      height: 6px;
      content: "";
      border-radius: 6px;
      border: solid 2px #fff;
      background: red;
    }
    .icon {
      position: absolute;
      left: 16px;
      top: 10px;
      width: 30px;
      height: 30px;
      line-height: 30px;
      font-style: normal;
      text-align: center;
      border-radius: 50%;
      pointer-events: none;
    }
    .more {
      background-size: 30px;
      background-repeat: no-repeat;
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA4ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTExIDc5LjE1ODMyNSwgMjAxNS8wOS8xMC0wMToxMDoyMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo1OWViM2M2My1mYjA3LTRiYWQtOTQzNS00MGFiMWU2MTc4ZjAiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QzRBMDU4NkM5M0IwMTFFNTg0RkRCQjRGMDBGQ0Y1QzQiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QzRBMDU4NkI5M0IwMTFFNTg0RkRCQjRGMDBGQ0Y1QzQiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowN2Y0MzdmZi02NzIwLTQxNzctYjUzMS1hYjQxYjBiMjBhMDciIHN0UmVmOmRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo1OGViODU0Yy03NTcxLTExNzgtOTgxZC1mODZiOTYwYWMzYzYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7jDnHMAAABWElEQVR42mL8//8/w2AGjKMOHHXgqANHogPfHdAjWY+QwyWyHMhEJY96A/E+IP4MxfugYhQDajiwEYi3ALEjEPNAsSNUrHGgHegFxHV45OugagbMgUVEqCkcSAeaUEkNzTMJzQClDjxDJTU0c2A/EWomDKQDtwJxMx75ZqiaAU2DoKLEF4j3A/FXKN4PFauj1HAWKqXlLVA82lgYGg70XPCaZIO2J4iiCrSSWA1X11OUSXyxtFZ8SLDeB4t+X2rl4hYg3oSltbKZQBGDXNRsxqIfZGYrpQ4E+bwaj3wNgZD0garBBaoIhSQhB1LaWimkUD9BB1LaWjGltLVDjZqEkZb6CTmQ0tbKaSL0n6bEgcS0Vvoo1N9PiQM3EygKWgnUwVugxRQu0A61g6I0CCom/LG0VvwIFCEwUIujteMPLWao0prZBMV0b+2MtmZGHTjqwFEH0hgABBgAJnh+OpttYTkAAAAASUVORK5CYII=);
    }
    .name {
      display: block;
      float: left;
      width: 160px;
      height: 50px;
      line-height: 50px;
      padding: 0 0 0 65px;
      letter-spacing: .2px;
      cursor: pointer;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      opacity: 0;
      transition: opacity .2s;
    }
  }
  &:hover .name { opacity: 1; }
  .source_search {
    position: fixed;
    left: 0;
    bottom: 0;
    opacity: 0;
    will-change: opacity;
    transition: opacity .4s, width .4s;
  }
  .search_container { box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);padding: 20px 20px 20px 20px; }
  .search_input {
    width: 0;
    height: 26px;
    padding: 8px;
    line-height: 26px;
    border: 0;
    border-radius: 15px;
    font-size: 12px;
    background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxOS4wLjEsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHZpZXdCb3g9Ii0xNiAxOCAzMCAzMCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAtMTYgMTggMzAgMzA7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+DQoJLnN0MHtmaWxsOiM4RjhGOEY7fQ0KPC9zdHlsZT4NCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00LDIxLjRjLTQuNi00LjYtMTItNC42LTE2LjYsMHMtNC42LDEyLDAsMTYuNmM0LjEsNC4xLDEwLjQsNC41LDE1LDEuM2MwLjEsMC41LDAuMywwLjksMC43LDEuMmw2LjcsNi43DQoJYzEsMSwyLjUsMSwzLjUsMHMxLTIuNSwwLTMuNUw2LjYsMzdjLTAuNC0wLjQtMC44LTAuNi0xLjItMC43QzguNSwzMS45LDguMSwyNS41LDQsMjEuNHogTTEuOSwzNS45Yy0zLjQsMy40LTksMy40LTEyLjQsMA0KCWMtMy40LTMuNC0zLjQtOSwwLTEyLjRzOS0zLjQsMTIuNCwwQzUuMywyNyw1LjMsMzIuNSwxLjksMzUuOXoiLz4NCjwvc3ZnPg0K);
    background-repeat: no-repeat;
    background-position: 96% center;
    background-size: 14px;
    box-sizing: border-box;
  }
  &:hover .source_search{ opacity: 1; width: 220px; }
  &:hover .search_input{ width: 100%; }
}
</style>
