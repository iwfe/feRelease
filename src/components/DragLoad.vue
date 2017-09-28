<template>
  <div class="win" :class="{ 'active': state }">

    <div class="win_box">
      <div class="win_title">静态资源上传</span></div>
      <div class="win_item">
        <div class="win_layout">拖拽上传吧</div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  data () {
    return {
      item: {},
    }
  }
}
</script>

<style>
.container {
  position: absolute;
  left: 0;
  top: 0;
}
</style>

