<template>
  <div class="auto_view">
    <div class="auto_view_list" @click="handlerClick(v)" v-for="v in item">{{ v.name }}</div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Array,
      default: []
    },
    itemClick: {
      type: Function,
      default: () => {}
    }
  }
}
</script>

<style>
  .auto_view {
    width: calc(90vw / 2);
    background: #fff;
    visibility: visible;
    box-shadow: 2px 2px 4px #999;
  }
  .auto_view_list {
    padding: 0 12px;
    height: 30px;
    line-height: 30px;
  }
</style>
