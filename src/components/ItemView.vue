<template>
  <div :class="[itemStyle === 'grid' ? 'item_tab' : 'item']" :style="{'min-height': item.length !== 0 ? 'calc(100vh - 160px)' : ''}">
    <div class="item_position"  v-if="itemStyle === 'grid' && item.length >= 1" style="padding: 0;">
      <div class="item_meta item_thead">
        <span>icon</span>
        <!-- <span style="width: 40px;flex: inherit;">id</span> -->
        <span>应用名称</span>
        <span>版本号</span>
        <span>目录名称</span>
        <span>更新时间</span>
        <span>操作</span>
      </div>
    </div>
    <div class="item_position" v-for="v in item">
      <div class="item_img" v-if="itemStyle !== 'grid'"><img :src="v.url || img"></div>
      <div class="item_meta">
        <span v-if="itemStyle === 'grid'" style="height: 32px;display: flex;align-items: center;">
          <img :class="{'item_img_gray':  v.onoff !== 1}" class="item_img" :title="v.id" :src="v.url || img">
        </span>
        <!-- <span v-if="itemStyle === 'grid'" style="width: 40px;flex: inherit;">{{ v.id }}</span> -->
        <span>{{ v.name }}</span>
        <span>{{ v.version }}</span>
        <span v-if="itemStyle === 'grid'">{{ v.folderName }}</span>
        <span v-if="itemStyle === 'grid'">{{ v.updateTime }}</span>
        <span class="icon">
          <i :data-tips="[v.onoff === 1 ? '开启' : '未开启']" class="iconfont icon-state tips_hover" @click="openState($event, v)" v-show="v.onoff !== 1"><b></b></i>
          <i data-tips="上传" class="iconfont icon-shangchuan tips_hover" @click="upload(v)"><b></b></i>
          <a v-if="v.onoffPath" :href="v.onoffPath" target="_blank"><i data-tips="开关下载" class="iconfont icon-wenjianjiasuoding tips_hover"><b></b></i></a>
          <a v-if="v.propertiesPath" :href="v.propertiesPath" target="_blank"><i data-tips="配置下载" class="iconfont icon-peizhiwenjianicon tips_hover"><b></b></i></a>
          <i :data-tips="[v.star === 1 ? '取消关注' : '添加关注']" v-if="itemStyle === 'grid' && $route.name === 'item' && $route.params.menu !== 'all'" :class="{'active': v.star === 1}" @click="handlerStar($event, v, 'add')" class="iconfont icon-xingxing tips_hover"><b></b></i>
          <i data-tips="编辑" class="iconfont icon-bianji tips_hover" @click="editItem(v)"><b></b></i>
          <i data-tips="删除" class="iconfont icon-lajitong tips_hover" @click="delItem(v)" v-show="$route.params.menu === 'all'"><b></b></i>
        </span>
      </div>
      <div class="item_icon" v-if="itemStyle !== 'grid'">
        <i :data-tips="[v.star === 1 ? '取消关注' : '添加关注']" v-if="$route.name === 'item' && $route.name === 'item' && $route.params.menu !== 'all'" class="iconfont icon-xingxing tips_hover" :class="{'active': v.star === 1}" @click="handlerStar($event, v, 'add')"><b></b></i>
        <i data-tips="取消关注" v-if="$route.name === 'star'" class="iconfont icon-lajitong tips_hover" @click="handlerStar($event, v, 'del')"><b></b></i>
      </div>
    </div>
    <div class="position_center" v-show="item.length === 0">
      <div class="nofavs">
        <h5 v-show="$route.name === 'recent'">最近一个月暂无上传项目</h5>
        <h5 v-show="$route.name === 'item'">暂无数据</h5>
        <h5 v-show="$route.name === 'star'">你没有关注的星级项目</h5>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { axios } from '../api'
  import { lock, getData } from '../common/util'
  import { Confirm, Alert } from '../common/confirm'
  import { loadUrl, staticUrl } from '../api/mock-data'
  import img from '../api/me_default.jpg'
  import Loading from '../common/loading'

  export default {
    props: {
      itemStyle: String
    },
    data () {
      return {
        img: img
      }
    },
    computed: {
      ...mapGetters(['item'])
    },
    methods: {
      upload (v) {
        this.$parent.targetUpload(v)
      },
      handlerStar (ev, item = {}, state) {
        let target = ''
        let ps = ''
        const id = window.config.id
        const itemId = item.id
        if (ev) target = ev.target

        switch (state) {
          case 'add':
            const star = target.classList.contains('active') ? 0 : 1
            if (star) {
              ps = this.$store.dispatch('patchUser', {id, itemId, state: 'add' })
              target.dataset.tips = '取消关注'
            } else {
              ps = this.$store.dispatch('patchUser', { id, itemId, state: 'del' })
              target.dataset.tips = '添加关注'
            }
            ps.then(() => {
              star ? target.classList.add('active') : target.classList.remove('active')
            })
            break
          case 'del':
            // 异步
            Confirm({
              title: '确定删除 ' + item.name
            }, (val) => {
              if (val === 'ok') {
                ps = this.$store.dispatch('patchUser', { id, itemId, state: 'del' })
                ps.then(() => {
                  this.$store.dispatch('deleteItem', item) // 删除项目
                  this.$parent.$parent.setStar(itemId) // 更新关注列表
                })
              }
            })
            break
        }
        // 回调可以解决 暂时用这个
        if (ps) {
          ps.then(() => {
            this.$parent.$parent.setStar(itemId) // 更新关注列表
          })
        }

        lock(ev)
      },
      openState (ev, item = {}) {
        if (ev.target.classList.contains('on')) {
          Alert('亲，已经是开启状态了')
        } else {
          Confirm({
            title: '确定开启<font style="color: red"> ' + item.name + ' </font>吗'
          }, (val) => {
            if (val === 'ok') {
              let dev = ''
              if (location.search) {
                const params = new URLSearchParams(location.search.slice(1))
                dev = params.get('dev')
              } else {
                dev = getData('dev')
              }

              axios('open', 'get', { dev, id: item.id, name: item.name }, (res) => {
                item.onoff = 1
                Loading.show(true)
                Toast.top(item.name + '已开启')
              }, (err) => {
                alert('上传失败啦')
              })

              // 后端接口
              // const url = staticUrl[dev] + loadUrl.openAuto
              // Axios.get(url, { params: { id: item.id }})
              // Loading.show(true)
              // setTimeout(() => {
              //   location.reload()
              // }, 1800)
            }
          })
        }
      },
      editItem (v) {
        this.$parent.$parent.editItem(true, v)
      },
      delItem (item) {
        Confirm({ title: `确定删除 ${item.name}吗? <br>(会同步更新菜单及用户关注的)` }, (val) => {
          if (val === 'ok') {
            this.$store.dispatch('delItem', { id: item.id, userId: window.config.id }).then((res) => {
              this.$store.dispatch('deleteItem', item)
              // 更新用户关注
              this.$parent.$parent.setStar(item.id)
            })
          }
        })
      }
    }
  }
</script>

<style lang="less">
.item_position {z-index: inherit;}
.item_position .iconfont {cursor: pointer;opacity: .7;}
.item_position .iconfont:hover {opacity: 1;}
.item {
  width: 100%;
  display: flex;
  display: -webkit-flex;
  justify-content: flex-start;
  flex-flow: row wrap;
  .item_position {
    position: relative;
    line-height: 40px;
    margin-right: 20px;
    margin-bottom: 20px;
    padding: 20px;
    box-shadow: inset 0 0 1px #757575;
    box-sizing: border-box;
    align-items: flex-start;
    align-self: flex-start;
    transition: box-shadow .3s ease-out, transform .2s ease-out;
  }
  .item_position:hover .item_icon { opacity: 1; }
  .item_img { position: absolute;left: 0;top: 0;width: 100%;height: 100%;overflow: hidden;box-shadow: 0 2px 20px 0 rgba(0,0,0,.06);border-radius: 3px;}
  .item_img img { width: 100%; }
  .item_meta {
    display: flex;
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 36px;
    padding: 0 6px;
    box-sizing: border-box;
  }
  .item_meta span { flex: 1;text-align: center;white-space: nowrap;}
  .item_icon { position: absolute;right: 10px;top: 10px;opacity: 0;transition: opacity .4s; }
  .item_icon i {
    display: block;
    width: 20px;
    height: 20px;
    line-height: 20px;
    text-align: center;
    cursor: pointer;
    background: #fff;
  }
}
.item_tab {
  color: #666;
  font-size: 14px;
  margin-right: 100px;
  .icon .iconfont { margin-left: 2px;font-size: 18px; }
  .item_position { padding: 18px 0; }
  .item_position span { flex: 1; }
  .item_img { width: 22px;height: 22px;border-radius: 50%;overflow: hidden;}
  .item_img_gray{-webkit-filter: grayscale(100%);opacity: .5;}
  .item_meta { display: flex;background: transparent;line-height: 32px;width: 100%; }
  .item_meta span { flex: 1;text-align: center; }
  .item_meta span:first-child { flex: initial;width: 30px;padding-left: 12px; }
  .header { height: 36px;line-height: 36px; }
  .sort { position: relative; }
  .sort:before, .sort:after { width: 0;height: 0;overflow: hidden;border-color: transparent;border-top: 6px solid #ddd; }
}
#main .icon-xingxing {color: #999;opacity: 1;}
#main .active {color: #F5CD13;}
#main .icon-state.active {color: #FF3466;}
.item_position:hover {z-index: 1000;}
.position_center {width: 100%;pointer-events: none;display: flex;align-items: center;justify-content: center;min-height: ~"calc(100vh - 122px)";}

</style>
