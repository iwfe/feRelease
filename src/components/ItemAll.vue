<template>
  <div class="item">
    <div class="item_position" :key="v.id" v-for="v in item" :class="{'active': v.star}">
      <div class="header">
        <img class="img" :src="img">{{ v.name }}
      </div>
      <div class="description">{{v.main || '项目简介...'}}</div>
      <div class="sourceFooter">
        <div class="tags"></div>
        <div style="float: right" v-show="show">
          <i class="iconfont icon-tianjia2" @click="handerClick($event, v)"></i>
          <i class="iconfont icon-duigou" @click="handerClick($event, v)"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import img from '../api/me_default.jpg'

  export default {
    props: {
      show: {
        type: Boolean,
        default: false
      },
      itemStyle: {
        type: String,
        default: ''
      },
      itemClick: {
        type: Function,
        default: function () {}
      }
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
      handerClick (e, v) {
        const item = e.target.parentNode.parentNode.parentNode
        item.classList.toggle('active')
        this.itemClick(v)
      }
    }
  }
</script>

<style>
.item {width: 100%;display: flex;display: -webkit-flex;justify-content: flex-start;flex-flow: row wrap;}
.item .item_position {position: relative;line-height: 40px;height: 180px;margin-right: 20px;margin-bottom: 20px;padding: 20px;align-items: flex-start;box-sizing: border-box;box-shadow: inset 0 0 1px #757575;transition: box-shadow .8s;background: none;-webkit-transition: box-shadow .8s;}
.item .item_position:hover {box-shadow: 0 0 15px rgba(0,0,0,0.15);}
.item .header {position: relative;height: 40px;line-height: 40px;padding: 0;padding-left: 60px;margin-bottom: 20px;font-size: 14px;}
.item .img {position: absolute;left: 0;top: 0;width: 40px;height: 40px;}
.item .description {color: #a8a8a8;line-height: 18px;height: 50px;}
.item .sourceFooter { height: 30px;line-height: 30px; }
.item .sourceFooter .tags {float: left;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;color: #c1c1c1;}
.item .sourceFooter .iconfont {display: block;width: 30px;height: 28px;line-height: 28px;text-align: center;border-radius: 3px;cursor: pointer;color: #999;color: #999;transition: background .2s;}
.item .sourceFooter .icon-duigou {display: none;}
.item .active {background: #fff;}
.item .active:hover{box-shadow: inset 0 0 1px #757575;};
.item .active .icon-tianjia2 {display: none;}
.item .active .icon-duigou {display: block;color: #fff;background: #47AE89;cursor: default;}
</style>
