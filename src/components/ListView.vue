<template>
  <div id="main">
    <header>
      <span v-if="$route.name === 'item'" class="path_ico">{{ $store.state.menuactive.name }} <b v-show="item.length">({{ item.length }})</b></span>
      <span v-if="$route.name === 'recent'" class="path_ico">最新上传的项目</span>
      <span v-if="$route.name === 'star'" class="path_ico fl" style="margin-right: 12px;">你的星级项目</span>
      <span v-if="$route.name === 'search'" class="path_ico">搜索结果</span>
      <div style="float: right;">
        <span v-if="$route.name === 'star'" ref="delTips" style="visibility: hidden;">你确定删除所有加星项目吗? <a class="blue_btn" @click="delItem">是</a>或<a @click="delTips('hidden', 'block')" class="blue_btn">取消</a></span>
        <i v-if="$route.name === 'star' && item.length > 1" ref="lajitong" style="margin-right: 12px;" class="iconfont icon-lajitong" @click="delTips('visible', 'none')">Delete All</i>
        <i v-if="$route.name !== 'recent' && $route.name !== 'search' && $route.name !== 'star'" class="iconfont icon-recent-contacts tips_hover" @click="$router.push({ name: 'recent' })" data-tips="最近上传"><b></b></i>
        <i v-if="item.length >= 1 && $route.name !== 'star'" class="iconfont icon-liebiao tips_hover" :class="[itemStyle === 'list' ? 'active' : '']" @click="tabList('list', $event)" data-tips="大图"><b></b></i>
        <i v-if="item.length >= 1 && $route.name !== 'star'" class="iconfont icon-grad tips_hover" :class="{'active': itemStyle === 'grid'}" @click="tabList('grid', $event)" data-tips="列表"><b></b></i>
        <i v-if="$route.name !== 'recent' && $route.name !== 'star'" @click="openCreate" class="iconfont icon-tianjia tips_hover" data-tips="新建项目"><b></b></i>
      </div>
    </header>

    <item-view :item-style="itemStyle"></item-view>
    <div class="dividing" v-show="item.length >= 1" style="margin-top: 36px;"><span>{{ dividings }}</span></div>
    <div class="footer">{{ footers }}</div>
    <transition appear name="section">
      <section>
        <div class="search">
          <input id="search_text" type="text" maxlength="18" class="input" @input="filterItem" ref="text" placeholder="搜索 应用名称 或 目录名称" />
          <div class="search_box">
            <i ref="close" class="iconfont icon-guanbi" style="padding-right: 8px; visibility: hidden;" @click="close"></i>
            <i class="iconfont icon-fangdajing" style="opacity: .5;"></i>
          </div>
          <!-- <auto-view :item="items" :item-click="selectItem" /> -->
        </div>
      </section>
    </transition>
  </div>
</template>

<script>
  import ItemView from './ItemView'
  import AutoView from './autoView'
  import { mapGetters } from 'vuex'
  import { setData, getData, delay } from '../common/util'
  import { footer, dividing, Store } from '../api/mock-data'

  export default {
    data () {
      return {
        footers: footer,
        dividings: dividing,
        itemStyle: 'grid',
        items: [] // autoview
      }
    },
    components: {
      ItemView,
      AutoView
    },
    computed: {
      ...mapGetters(['item'])
    },
    created () {
      const obj = getData('itemstyle')
      if (obj) this.itemStyle = obj.style
    },
    mounted () {
      const name = this.$route.query.name
      if (name) this.$refs.text.value = name
    },
    beforeDestroy () {
      console.log('准备销毁listView')
    },
    destroy () {
      console.log('销毁listView')
    },
    beforeRouteEnter (to, from, next) {
      console.log('进入listView组件')
      next(vm => { // e_e!
        if (to.name === 'star') {
          vm.itemStyle = 'list'
        } else {
          const obj = getData('itemstyle')
          if (obj) {
            vm.itemStyle = obj.style
          }
        }
      })
    },
    beforeRouteUpdate (to, from, next) {
      console.log('更新listView组件')
      next()
    },
    beforeRouteLeave (to, from, next) {
      console.log('离开listView组件') // 离开会在router之前触发
      next()
    },
    methods: {
      beforeEnter () {
        console.log('进入前')
      },
      tabList (name, event) {
        setData('itemstyle', {
          style: name,
          route: this.$route.name
        })
        this.itemStyle = name
      },
      openCreate () {
        this.$parent.openCreate(true)
      },
      delTips (show, hide) {
        this.$refs.delTips.style.visibility = show
        this.$refs.lajitong.style.display = hide
      },
      targetUpload (v) {
        this.$parent.parentTargetUpload(v)
      },
      searchItem () {
        const val = this.$refs.text.value.replace(/\s/g, '')
        if (!val) return
        this.$router.push({ name: 'search', query: { name: val }})
      },
      delItem () {
        this.$store.dispatch('patchUser', { id: window.config.id, state: 'delAll' })
        .then((res) => {
          this.$store.dispatch('setItem')
          this.delTips('hidden', 'block')
          this.$parent.setStar()
        })
      },
      filterItem (e) {
        const val = e.target.value.replace(/\s/g, '')
        if (val) {
          delay(() => {
            this.$store.dispatch('filterItem', val)
          }, 300)
          this.$refs.close.style.visibility = 'visible'
        } else {
          this.$refs.close.style.visibility = 'hidden'
          this.$store.dispatch('setItem', Store.allItem)
        }
      },
      close () {
        if (Store.allItem) this.$store.dispatch('setItem', Store.allItem)
        this.$refs.text.value = ''
        this.$refs.close.style.visibility = 'hidden'
      }
    }
  }
</script>

<style lang="less">
#main {
  margin-left: 100px;
  padding: 65px 63px 20px 65px;
  overflow-y: auto;
  box-sizing: border-box;
  -webkit-transition: margin-left .2s;
  &::-webkit-scrollbar { width: 0; }
  section {
    position: fixed;
    top: 0;
    left: 66px;
    right: 0;
    height: 45px;
    padding-top: 15px;
    padding-left: 100px;
    text-align: center;
    .search {
      position: relative;
    }
    .input {
      position: relative;
      overflow: hidden;
      display: inline-block;
      width: 100%;
      height: 32px;
      line-height: 32px;
      padding: 5px 10px;
      box-sizing: border-box;
      font-size: 14px;
      font-family: "open sans";
      font-weight: 300;
      border: 0;
    }
    .search_box {
      position: absolute;
      right: 8px;
      top: 4px;
    }
    .blue_btn {
      width: 60px;
      color: #fff;
      background: #4588F1;
    }
    .blue_btn:hover { background: #2359B1; }
    .input::-webkit-input-placeholder {
      font-style: italic;
      letter-spacing: .5px;
      color: #999;
    }
  }
  header {
    // display: flex;
    line-height: 50px;
    margin-right: 100px;
    font-size: 16px;
    .iconfont { margin-right: 4px;color: #999;cursor: pointer; }
    .icon_active { color: #666; }
    .path_ico {
      background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxOS4xLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHZpZXdCb3g9IjAgMCAxMS45IDE5LjQiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDExLjkgMTkuNDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4NCgkuc3Qwe2ZpbGwtcnVsZTpldmVub2RkO2NsaXAtcnVsZTpldmVub2RkO2ZpbGw6IzQ3NDc0Nzt9DQo8L3N0eWxlPg0KPGc+DQoJPGc+DQoJCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0xMS4zLDguMUwzLjMsMGMtMC43LTAuNy0yLTAuNy0yLjcsMGMtMC43LDAuNy0wLjcsMiwwLDIuN2w2LjcsNi43bC02LjcsNi43Yy0wLjcsMC43LTAuNywyLDAsMi43DQoJCQljMC43LDAuNywyLDAuNywyLjcsMGw4LjEtOC4xQzEyLjEsMTAsMTIuMSw4LjgsMTEuMyw4LjF6Ii8+DQoJPC9nPg0KPC9nPg0KPC9zdmc+DQo=) no-repeat center center;
      background-size: auto 0;
      margin-left: 0px;
    }
    .blue_btn {
      margin: 0 4px;
      color: #FF3466;
      cursor: pointer;
    }
    .active {color: #FF3466;}
  }
  .item .item_position:hover { box-shadow: 0 15px 20px rgba(0, 0, 0, 0.2); transform: translate(0, -4px); }
}
</style>
