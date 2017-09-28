import router from './router'
import store from './store'
import App from './App.vue'

// import VueLazyload from 'vue-lazyload'
// Vue.use(VueLazyload, {
//   loading: '默认图片',
//   error: '加载错误图片'
// })

new Vue({
  store,
  router,
  el: '#root',
  render: h => h(App)
})

// Vue.config.debug = true
// https://www.ibm.com/developerworks/cn/web/1101_hanbf_fileupload
