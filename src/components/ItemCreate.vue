<template>
  <div class="win" :class="{ 'active': state }">
    <div class="win_box">
      <div class="win_title">新增上传</div>

      <!--  <div class="win_item">
        <div id="showimg" ref="img" class="win_itemImg"></div>
        <div class="win_edit_item">
        </div>
      </div> -->

      <!-- <div class="win_item" ref="hidden">
        <div class="win_layout">项目图片</div>
        <div class="win_edit_item">
          <input accept="image/*"  type="file" class="win_input" ref="file" title="multiple" @change="changeFiles">
        </div>
      </div> -->

      <div class="win_item">
        <div class="win_layout"><span style="color: red;">*</span>项目名称</div>
        <div class="win_edit_item">
          <input type="text" class="win_input" v-model="params.name">
        </div>
      </div>

      <div class="win_item">
        <div class="win_layout"><span style="color: red;">*</span>目录名称</div>
        <div class="win_edit_item">
          <input type="text" class="win_input" v-model="params.folderName">
        </div>
      </div>

      <div class="win_item">
        <div class="win_layout"><span style="color: red;">*</span>上传域名</div>
        <div class="win_edit_item">
          <select v-model="params.ossType" style="width: 80%;border: 1px solid #ddd;height: 36px;line-height: 36px;">
            <option v-for="v in getCdn" :value="v.key">{{ v.val }}</option>
          </select>
        </div>
      </div>

      <div class="win_item">
        <div class="win_layout">项目简介</div>
        <div class="win_edit_item">
          <textarea type="text" class="win_input" style="resize: none;" v-model="params.memo" />
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
import { axios } from '../api'
import { cdn } from '../api/mock-data'

export default {
  props: {
    state: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      params: {
        name: '',
        memo: '',
        folderName: '',
        ossType: 1 // 'ossCDN类型：1：iwjw ； 2：fyb'; 3:files
        // createTime: '', // 创建时间
        // updateTime: '', // 更新时间
        // propertiesPath: '', // 映射文件oss路径
        // onoffPath: '', // 是否自动更新资源开关文件
        // onoff: '', // 自动更新开关 0-关闭 1-开启
        // versionType: '', // 版本管理方式0-自动管理；1-手动管理
        // isDelete: '', // 是否删除 0正常, 1删除
        // version: '', // 版本号
        // parentId: '' // 上级项目ID
      }
    }
  },
  computed: {
    getCdn () {
      return cdn
    }
  },
  methods: {
    submit () {
      if (!this.params.name) {
        Toast.top('项目名称不能为空')
        return
      }

      if (!this.params.folderName) {
        Toast.top('目录名称不能为空')
        return
      }

      this.$store.dispatch('createItem', this.params).then((res) => {
        this.reset()
        this.$parent.openCreate(false)
        this.$store.dispatch('postItem', res[0])

        // 菜单不是all
        if (this.$route.params.menu !== 'all') {
          this.$store.dispatch('addDev', {
            menuId: this.$store.state.menuactive.id,
            itemId: res[0].id // 新建的项目id
          })
        }

      }).catch((err) => {
        console.info(err) // 可以js捕获错误
      })
    },
    cancel () {
      this.$parent.openCreate(false)
    },
    changeFiles () {
      const box = this.$refs.img
      const file = this.$refs.file.files[0]
      const fr = new FileReader()
      fr.readAsDataURL(file)
      fr.onload = () => {
        const img = document.createElement('img')
        img.innerHTML = ''
        img.src = fr.result
        box.appendChild(img)
        box.style.display = 'block'
        this.$refs.hidden.style.display = 'none'
      }
    },
    reset () {
      // const box = this.$refs.img
      // box.style.display = 'none'
      // box.innerHTML = ''
      // this.$refs.hidden.style.display = 'block'
      // this.$refs.file.value = ''
      this.params.name = ''
      this.params.ossType = 1
      this.params.folderName = ''
      this.params.memo = ''
      // this.error.error = '模拟错误'
    }
  }
}
</script>

<style> /* scoped */
#showimg {
  display: none;
  position: relative;
  width: 50px;
  height: 50px;
}
#showimg img {
  width: 50px;
  height: 50px;
}
.upload_itemImg img {
  width: 100px;
  height: 100px;
}
</style>
