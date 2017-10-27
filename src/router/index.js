const Home = r => require.ensure([], () => r(require('../pages/Home.vue')), 'home')
const SignIn = r => require.ensure([], () => r(require('../pages/SignIn.vue')), 'signin')
const ItemView = r => require.ensure([], () => r(require('../components/ListView.vue')), 'listview')
const Error = r => require.ensure([], () => r(require('../pages/Error.vue')), 'error')
const All = r => require.ensure([], () => r(require('../pages/All.vue')), 'all')
const log = str => console.log(str)

// import history from '../common/util'
import Router from 'vue-router'
import store from '../store'
import { setData } from '../common/util'

Vue.use(Router)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    beforeEnter: (to, from, next) => {
      log('router-beforeEnter-home')
      const query = location.search.slice(1)
      if (query) {
        const dev = new URLSearchParams(query).get('dev') // ？
        if (dev) setData('dev', dev)
      }
      store.dispatch('getMenu', () => { // 保证每个路由菜单都是最新的
        next()
      })
    },
    children: [
      {
        name: 'recent',
        path: '',
        component: ItemView,
        beforeEnter: (to, from, next) => {
          store.dispatch('selectMenu')
          store.dispatch('getItemRecent', () => {
            next()
          })
        }
      },
      {
        name: 'item',
        path: 'home/:menu',
        component: ItemView
      },
      {
        name: 'search',
        path: 'search',
        component: ItemView,
        beforeEnter: (to, from, next) => {
          store.dispatch('searchItem', to.query.name)
          next()
        }
      },
      {
        name: 'star',
        path: 'star',
        component: ItemView,
        beforeEnter: (to, from, next) => {
          store.dispatch('starItem')
          next()
        }
      }
    ]
  },
  {
    path: '/all',
    name: 'all',
    component: All,
    beforeEnter: (to, from, next) => {
      log('router-beforeEnter-all')
      // 路由跳转 ajax返回数据存在延迟，造成逻辑判断错误 所以先找到数据，避免二次更新
      store.dispatch('getItemAll', () => {
        if (store.state.menu.length > 1) {
          next()
        } else {
          store.dispatch('getMenu', () => {
            next()
          })
        }
      })
    }
  },
  {
    path: '/signin',
    name: 'signin',
    component: SignIn
  },
  {
    path: '*',
    component: Error
  }
]

const router = new Router({
  path: '/',
  mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {
  log(to)
  log(from)
  log('router-beforeEach')
  next()
})

router.afterEach((route) => {
  log('router-afterEach')
  // console.log(route)
})

router.onReady((res) => {
  log('router-ready')
  const theme = localStorage.getItem('theme') || 'light'
  document.body.classList.add(theme)
})

export default router
