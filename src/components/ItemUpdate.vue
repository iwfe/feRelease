<template>
  <div class="win" :class="{ 'active': state }">
    <div class="win_box">
      <div class="win_title">编辑项目信息</div>

      <div class="win_item">
        <div class="win_layout">项目名称</div>
        <div class="win_edit_item">
          <input type="text" class="win_input" v-model="item_copy.name">
        </div>
      </div>

      <!-- <div class="win_item">
        <div class="win_layout">目录名称</div>
        <div class="win_edit_item">
          <input type="text" class="win_input" v-model="item_copy.folderName">
        </div>
      </div> -->

      <!-- <div class="win_item">
        <div class="win_layout">上传域名</div>
        <div class="win_edit_item">
          <select v-model="item_copy.ossType" style="width: 80%;border: 1px solid #ddd;height: 36px;line-height: 36px;">
            <option v-for="(v, i) in getCdn" :value="v.key">{{ v.val }}</option>
          </select>
        </div>
      </div> -->

      <div class="win_item">
        <div class="win_layout">项目简介</div>
        <div class="win_edit_item">
          <textarea v-model="item_copy.memo" class="win_input" />
        </div>
      </div>

      <div class="win_item">
        <div class="win_edit_item">
          <a class="win_btn green_btn" @click="submit">确定</a>
          <a class="win_btn" @click="cancel">取消</a>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
  import { cdn } from '../api/mock-data'
  export default {
    data () {
      return {
        state: false,
        item: {},
        item_copy: {}
      }
    },
    computed: {
      getCdn () {
        return cdn
      }
    },
    methods: {
      setItem (state, item) {
        this.state = state
        this.item = item
        this.item_copy = Object.assign({}, this.item)
      },
      submit () {
        const oldItem = JSON.stringify(this.item)
        const newItem = JSON.stringify(this.item_copy)
        if (oldItem === newItem) {
          this.cancel()
        } else {
          this.$store.dispatch('updateItem', this.item_copy)
          .then((res) => {
            // 手动更新 list 的数据
            this.item.name = this.item_copy.name
            this.item.folderName = this.item_copy.folderName
            this.item.memo = this.item_copy.memo
            this.item.ossType = this.item_copy.ossType
            this.cancel()
          })
          .catch((err) => {
            this.cancel()
          })
        }
      },
      cancel () {
        this.state = false
        this.$parent.mask = false
      }
    }
  }
</script>

<style>

</style>
