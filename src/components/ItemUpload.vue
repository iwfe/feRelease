<template>
  <div class="win" :class="{ 'active': state }">
    <div class="win_box">
      <div class="win_title">静态资源上传</span></div>
      <div class="win_item">
        <div class="win_layout">当前环境</div>
        <div class="win_edit_item">
          <div class="win_input active">{{ dev }}</div>
        </div>
      </div>
      <div class="win_item">
        <div class="win_layout">项目名称</div>
        <div class="win_edit_item">
          <div class="win_input active">{{ item.name }}</div>
        </div>
      </div>
      <div class="win_item">
        <div class="win_layout">上次更新</div>
        <div class="win_edit_item">
          <div class="win_input active">{{ item.updateTime }}</div>
        </div>
      </div>

      <div class="win_item">
        <div class="win_layout">上个版本</div>
        <div class="win_edit_item">
          <input type="text" class="win_input active" :value="item.version">
        </div>
      </div>

      <div class="win_item">
        <div class="win_layout">当前版本</div>
        <div class="win_edit_item">
          <input ref="version" type="text" class="win_input">
        </div>
      </div>

      <div class="win_item">
        <div class="win_layout">资源文件<span style="color:red;">*</span></div>
        <div class="win_edit_item">
          <div class="win_input" style="padding: 0;position: relative;">
            <span style="position: absolute;left: 12px;top: 4px;">{{ tips }}</span>
            <input style="opacity: 0;" type="file" @change="filterName" class="win_input" name="zip" ref="zip">
          </div>
        </div>
      </div>

      <div class="win_item">
        <div class="win_layout">自动开启</div>
        <div class="win_edit_item">
          <div class="win_input" style="padding: 0;border: 0;">
            <input type="radio" id="open" value="open" v-model="auto" style="margin-top:12px;font-size: 14px;">
            <label for="open" style="padding-left: 6px;">是</label>
            <input type="radio" id="off" value="off" v-model="auto" style="margin-left: 24px;">
            <label for="off" style="padding-left: 6px;">否</label>
          </div>
        </div>
      </div>

      <!-- <div class="win_item">
        <div class="win_layout">上传环境<span style="color:red;">*</span></div>
        <div class="win_edit_item">
          <div class="win_input" style="border: 0;">
            <label for="test" style="margin-right: 24px;"><input id="test" type="radio" value="test" v-model="dev"> test</label>
            <label for="bate"><input id="bate" type="radio" value="bate" v-model="dev"> bate</label>
          </div>
        </div>
      </div> -->

      <div class="win_item pt">
        <div class="win_edit_item">
          <a ref="upload_btn" class="win_btn" :class="{ 'green_btn': zip }" @click="upload">上传</a>
          <a class="win_btn" @click="setState(false)">取消</a>
          <span style="color: red;">{{ error }}</span>
        </div>
      </div>
    </div>
    <!-- <div id="drag_area">
      <div id="list"></div>
    </div> -->
  </div>
</template>

<script>
import loading from '../common/loading'
import { Alert } from '../common/confirm'
import { uploadZip, axios } from '../api'
import { getData, getDev } from '../common/util'
import { staticUrl, loadUrl } from '../api/mock-data'

export default {
  data () {
    return {
      dev: getDev(),
      auto: 'open',
      item: {},
      state: false,
      error: '',
      zip: false,
      tips: '上传zip包'
    }
  },
  created () {
    if (this.dev === 'prod') this.auto = 'off'
  },
  mounted () {
    // const area = document.querySelector('#drag_area')
    // area.addEventListener('dragover', (e) => {
    //   console.log(1)
    //   e.stopPropagation()
    //   e.preventDefault()
    //   e.dataTransfer.dropEffect = 'copy'
    // })

    // area.addEventListener('dragenter', (e) => {
    //   console.log(2)
    //   e.stopPropagation()
    //   e.preventDefault()
    // })

    // area.addEventListener('dragleave', (e) => {
    //   console.log(3)
    //   e.stopPropagation()
    //   e.preventDefault()
    // })

    // area.addEventListener('drag', (e) => {
    //   console.log(4)
    //   e.stopPropagation()
    //   e.preventDefault()
    // })
  },
  methods: {
    setState (state, item) {
      this.error = ''
      this.state = state
      this.$parent.mask = state
      if (state) {
        this.item = item
        this.$refs.version.value = this.item.version
        this.zip = false
        this.$refs.zip.value = ''
        this.$refs.upload_btn.innerHTML = '上传'
        const arr = this.item.version.split('.') // 只能是 . 和 数字
        arr[arr.length - 1] = parseInt(arr[arr.length - 1]) + 1
        this.$refs.version.value = arr.join('.')
        this.tips = '上传zip包'
      }
    },
    upload (e) {
      if (!e.target.classList.contains('green_btn')) return
      // const dev = this.$route.query.dev || getData('dev')
      const url = staticUrl[this.dev] + loadUrl.autoUpload
      this.zip = false
      e.target.innerHTML = '上传中'
      loading.show()
      // 参数对象
      const fd = new FormData()
      fd.append('auto', this.auto)
      fd.append('dev', this.dev)
      // fd.append('isCoverVer', '1') // 是否覆盖旧版本 0:否，1：是
      // fd.append('versionType', '1') // 上传方式 0:自动，1：手动
      fd.append('version', this.$refs.version.value) // 如果是手动上传可以按自己的规则填写，如果是自动上传，保证上一个版本号是整数，否则报错
      fd.append('projectId', this.item.id) // 项目id
      fd.append('file', this.$refs.zip.files[0]) // zip或者rar文件，名称必须与项目名一致，如：iwcms.zip
      // var formData = new FormData(form) // 2
      // var formData = form.getFormData() // 3
      // alert(JSON.stringify(this.item))

      uploadZip('upload', fd, (res) => {
        const _add = Object.keys(res.data.add)
        const _diff = Object.keys(res.data.diff)
        // 返回结果 手动更新当前item数据
        if (res.status === 1) {
          let add = ''
          let diff = ''
          if (_add.length >= 1) {
            add = '<div class="text_left"><span style="float: left;">新增文件：</span>'
            for (const key in res.data.add) {
              add += '<div style="margin-left: 75px;">' + key + '</div>'
            }
            add += '</div>'
          } else {
            add = '<div class="text_left">新增文件：无</div>'
          }

          if (_diff.length >= 1) {
            diff = '<div class="text_left"><span style="float: left;">变更文件：</span>'
            for (const key in res.data.diff) {
              diff += '<div style="margin-left: 75px;">' + key + '</div>'
            }
            diff += '</div>'
          } else {
            diff = '<div class="text_left">变更文件：无</div>'
          }

          this.setState(false)

          if (_add.length || _diff.length)  {
            this.item.version = this.$refs.version.value
            // 记录日志
            const params = {
              userid: window.config.id,
              dev: this.dev,
              name: this.item.name,
              version: this.item.version
            }
            axios('log', 'post', params)
            .then((res) => {
              if (res.timer) {
                params.timer = res.timer
                this.$emit('logger', params)
              }
            })
          }

          this.item.onoff = res.data.auto ? 1 : 0 // 命令上传
          this.item.updateTime = res.data.time
          Alert({
            text: '<div class="text_left">项目名称：' + this.item.name + '</div><div class="text_left">版本号码：' +  this.item.version + '</div>' + add + diff
          })
          // axios('pushMessage', 'get', { dev: this.dev, id: this.item.projectId })
          // 向所有关注项目的用户，推送消息
        } else {
          Toast.top(res.msg)
        }
      })

    },
    filterName (e) {
      const val = e.target.value
      const type = val.replace(/.+\./, '')
      if (type !== 'zip') {
        this.error = '必须是zip包'
        this.zip = false
        return
      }
      if (val.lastIndexOf(this.item.folderName + '.zip') === -1) {
        this.error = '必须是' + this.item.folderName + '.zip'
        this.zip = false
        return
      }
      this.tips = this.item.name + '.zip'
      this.error = ''
      this.zip = true
      this.$refs.zip.blur()
    }
  }
}
</script>

<style>
  .pt {
    padding-top: 6px;
  }
  #drag_area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: #fff;
    opacity: .5;
  }
  .dialog .text_left {
    clear: both;
    text-align: left;
  }
</style>

