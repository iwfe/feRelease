<template>
  <div id="all">
    <div class="filters">
      <strong>Menu:</strong>
      <strong v-show="menu.length === 0" style="color: #999;"> No Menu</strong>
      <span v-for="v in menu" :class="{'active': menuactive === v}" @click="selectMenu(v)"> {{ v.name }}
        <b style="color: #47AE89;" v-show="$route.query.dev === 'beta'">{{ v.beta && v.beta.length}}</b>
        <b style="color: #47AE89;" v-show="$route.query.dev === 'test'">{{ v.test && v.test.length}}</b>
        <i @click="delMenu(v, $event)" class="iconfont icon-guanbi tips_hover" data-tips="删除菜单"><b></b></i>
      </span>
      <div style="cursor:pointer;position:absolute;right:0;top:0;">
        <i @click="editMenu" v-show="this.menuactive" class="iconfont icon-bianji tips_hover" data-tips="编辑名称"><b></b></i>
        <i @click="addMenu" class="iconfont icon-tianjia tips_hover" data-tips="添加菜单"><b></b></i>
      </div>
    </div>

    <item-all :show="show" :item-click="handerClick" />

    <transition appear name="section">
      <header>
        <div class="search">
          <input ref="text" @input="resetItem" @keyup.enter="filterItem" placeholder="请输入应用名称 或 目录名称" class="search_input">
          <div class="position_right">
            <i class="iconfont icon-guanbi" style="visibility: hidden;padding-right: 0;cursor: pointer;" ref="close" @click="close"></i>
            <i @click="$refs.text.blur()"  class="iconfont icon-fangdajing"></i>
          </div>
        </div>
        <div class="done"><a @click="saveMenu">保存数据</a><a @click="cancel">取消</a></div>
      </header>
    </transition>

    <div class="dividing"><span>{{ dividings }}</span></div>
    <div class="footer">{{ footers }}</div>
  </div>
</template>

<script>
  import ItemAll from '@/ItemAll'
  import { axios } from '../api'
  import { mapGetters } from 'vuex'
  import { Confirm } from '../common/confirm'
  import { footer, dividing, Store } from '../api/mock-data'
  import { forEach, lock, delay, getDev } from '../common/util'
  const dev = getDev()

  export default {
    data () {
      return {
        footers: footer,
        dividings: dividing,
        show: false, // 添加按钮
        lock: false, // 数据变动
        menu: [],
        menuactive: ''
      }
    },
    computed: { ...mapGetters(['item']) },
    components: { ItemAll },
    created () {
      const menu = this.$route.query.menu === 'all' ? undefined : this.$route.query.menu
      this.menu = JSON.parse(JSON.stringify(this.$store.state.menu.slice(1))) // [{}]

      if (this.menu.length >= 1) {
        this.show = true
        forEach(this.menu, (val, i) => {
          // 防止属性不存在
          if (!val['test']) val['test'] = []
          if (!val['beta']) val['beta'] = []
          if (!val['prod']) val['prod'] = []
          if (menu && menu === val.path) this.menuactive = val
          if (!menu && i === 0) this.menuactive = val
        })
        if (this.menuactive[dev].length >= 1) this.filterStar()
      }
    },
    methods: {
      saveMenu (next) {
        const lock = this.compared()
        if (lock) {
          this.lock = true
          this.cancel()
          return
        }
        axios('menu', 'patch', { menus: this.menu })
        .then((res) => {
          this.lock = true
          if (typeof next === 'function') {
            next()
          } else {
            this.cancel()
          }
        })
      },
      cancel () {
        this.lock = true
        // 可能存在错误的历史记录
        // window.history.length >= 1 ? window.history.back() : window.location.href = '/'
        const obj =  window.history.length ? { name: 'item', params: { dev, menu: this.menuactive.path }} : { name: 'home', query: { dev }}
        this.$router.push(obj)
      },
      compared () {
        return JSON.stringify(this.menu) === JSON.stringify(this.$store.state.menu.slice(1))
      },
      delMenu (v, e) {
        Confirm({ title: '确定删除菜单吗' }, (val) => {
          if (val === 'ok') {
            if (this.menuactive === v) this.menuactive = ''
            this.menu.splice(this.menu.indexOf(v), 1)
            if (this.menuactive === '' && this.menu.length >= 1) {
              this.selectMenu(this.menu[0])
            } else {
              // 没有菜单时清除上一个菜单遗留的 star
              forEach(this.item, (val) => {
                if (val.star) delete val.star
              })
              this.$store.dispatch('setItem', this.item)
            }
            this.show = this.menu.length ? true : false
          }
        })
        lock(e)
      },
      editMenu () {
        let input = null
        Confirm({
          title: '修改名称',
          text: '<div><input id="editInput" value="' + this.menuactive.name + '" placeholder="输入菜单名" type="texr" style="width: 100%;resize: none; border: 1px solid #ddd;height: 36px;line-height: 36px;text-align: center;font-size:16px;" /></div>',
          ready: () => {
            input = document.querySelector('#editInput')
            input.addEventListener('keydown', (e) => {
              if (e.keyCode === 13) conform.remove('ok')
            })
            input.focus()
          }
        }, (val) => {
          if (val === 'ok') {
            const name = input.value.replace(/\s/g, '')
            this.menuactive.name = name
          }
        })
      },
      addMenu () {
        let input = null
        const conform = Confirm({
          title: '新建菜单',
          text: '<div><input id="addInput" placeholder="输入菜单名" type="texr" style="width: 100%;resize: none; border: 1px solid #ddd;height: 36px;line-height: 36px;text-align: center;font-size:16px;" /></div>',
          ready: () => {
            input = document.querySelector('#addInput')
            input.addEventListener('keydown', (e) => {
              if (e.keyCode === 13) conform.remove('ok')
            })
            input.focus()
          }
        }, (key) => {
          if (key === 'ok') {
            const name = input.value.replace(/\s/g, '')
            const menu = { name, test: [], beta: [], prod: [] } // 服务端 可以帮助添加默认值
            if (name) this.menu.push(menu)
            this.show = true
            this.selectMenu(menu)
          }
        })
      },
      handerClick (v) {
        v['star'] = true
        const arr = this.menuactive[dev]
        arr.indexOf(v.id) <= -1 ? arr.push(v.id) : arr.splice(arr.indexOf(v.id), 1)
        this.selectMenu(this.menuactive)
      },
      selectMenu (v) {
        this.$store.dispatch('setItem', this.item.slice(0)) // 重置才能触发重绘
        if (this.menuactive !== v) {
          this.filterStar(v[dev])
        }
        this.menuactive = {} // 更新count
        this.menuactive = v
      },
      filterStar (arr) {
        const item = this.item.slice(0)
        const itemId = arr || this.menuactive[dev]
        forEach(item, (obj, key) => {
          delete obj.star
          forEach(itemId, (val) => {
            if (obj.id === val) obj['star'] = true // 标识选中的对象
          })
        })
        this.$store.dispatch('setItem', item)
      },
      filterItem () {
        delay(() => {
          const text = this.$refs.text.value.replace(/\s/g, '')
          if (text) this.$store.dispatch('filterItem', text)
        }, 300)
      },
      resetItem () {
        const val = this.$refs.text.value.replace(/\s/g, '')
        if (!val) {
          delay(() => {
            this.$store.dispatch('setItem', Store.allItem)
          }, 100)
          this.$refs.close.style.visibility = 'hidden'
        } else {
          this.filterItem()
          this.$refs.close.style.visibility = 'visible'
        }
      },
      close () {
        this.$refs.text.value = ''
        this.resetItem()
      }
    },
    beforeRouteLeave (to, from, next) {
      if (!this.lock) {
        const lock = this.compared()
        if (lock) {
          next()
        } else {
          Confirm({ title: '有未保存的数据,是否保存？' }, (val) => {
            if (val === 'ok') {
              this.saveMenu(next)
            } else {
              next()
            }
          })
        }
      } else {
        next()
      }
      this.$store.dispatch('setItem') // 防止闪动
    }
  }
</script>

<style lang="less">
  #all {
    width: 90vw;
    margin: 0 auto;
    padding-bottom: 100px;
    header {
      position: fixed;
      left: 0;
      top: 0;
      width: ~"calc(90vw + 7px)";
      height: 30px;
      line-height: 30px;
      padding: 15px ~"calc(5vw - 10px)";
      background: #fff;
      box-shadow: 2px 0 8px #c1c1c1;
    }
    .search { position: relative; float: left;width: ~"calc(50% - 10px)";}
    .search .position_right {position: absolute;right: 0;top: 0;overflow: hidden;}
    .search_input { width: 100%;height: 30px;padding: 8px;font-size: 14px;line-height: 14px;box-sizing: border-box;border: 0;background: #F4F4F4;}
    .search .icon-fangdajing, .search .icon-guanbi { display: inline-block;padding: 0 8px;cursor: pointer;color: #999;}
    .done { float: right; width: 50%; }
    .done a {
      display: block;
      float: right;
      width: 100px;
      text-align: center;
      text-decoration: none;
      cursor: pointer;
    }
    .done a:first-child {
      background: #ff3466;
      border-radius: 15px;
      color: #fff;
    }
    .done a:nth-child(2) { background: transparent; color: #93979f;} // text-transform: uppercase;
    .filters {
      position: relative;
      min-height: 42px;line-height: 42px;
      margin-top: 100px;
      margin-bottom: 40px;
      padding-right: 16px;
    }
    .filters .iconfont { opacity: .7;font-size: 20px; }
    .filters .iconfont:hover { opacity: 1; }
    .filters span {
      position: relative;
      display: inline-block;
      height: 30px;
      line-height: 30px;
      padding: 0 6px 0 12px;
      text-align: center;
      margin-left: 5px;
      background: #eaeaea;
      border-radius: 15px;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow: inset 0 0 3px #d5d5d5;
    }
    .filters .active { background: #fff;}
    .filters .icon-guanbi { display:inline-block;width: 14px;height: 14px;line-height: 14px;text-align:center;font-size: 12px;background: #999;color: #fff;border-radius: 50%;padding: 2px;}
    .filters .icon-guanbi:hover, .search .icon-guanbi:hover, .search .icon-fangdajing:hover { opacity: 1;}
  }
  .dialog { min-width: 200px; max-width: 320px; }
</style>
