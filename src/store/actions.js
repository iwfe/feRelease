import * as api from '../api'
import * as type from './mutations-types'
import { all, icon, Store } from '../api/mock-data'
import { updateStarloop, forEach, getDev, filterNewItem } from '../common/util'
let Star = []

export const getMenu = ({ commit, state }, cb) => {
  api.axios('menu', 'get', {}, (res) => {
    forEach(res, (val, index, arr) => {
      Object.assign(val, icon[index])
    })
    filterNewItem(res)
    res.unshift(all)
    commit(type.MENUGET, res)
    cb && cb()
  })
}

// export const postMenu = ({ commit, state }, params) => {
//   let router = null
//   if (params.router) {
//     router = params.router
//     delete params.router
//   }
//   api.axios('menu', 'post', params, (res) => {
//     let ico = icon[state.menu.length]
//     if (!ico) ico = icon[state.menu.length - 1]
//     Object.assign(res[0], ico)
//     commit(type.MENUADD, res)
//     selectMenu({ commit }, res[0], true) // 新建菜单
//     router && router.push({ path: `/home/${ico.path}` })
//   })
// }

export const delMenu = ({ commit }, obj) => {
  commit(type.MENUDEL, obj)
}

/* 查询当前菜单下关联的项目 */
export const selectMenu = ({ commit }, obj, lock) => {
  const dev = getDev()
  if (!obj) obj = {}
  if (obj.star) Star = obj.star
  delete obj.star
  commit(type.MENUACTIVE, obj)
  if (!obj[dev] || obj[dev].length === 0) {
    setItem({ commit })
  } else {
    if (!lock && obj.path && obj.path !== 'all') {
      __getItem({ commit }, { itemId: obj[dev], dev })
    }
  }
}
export const addDev = ({ commit, state }, params) => {
  params.dev = getDev()
  api.axios('addDev', 'get', params, (res) => {
    // 手动添加新创建的项目id
    state.menuactive[params.dev].push(params.itemId)
  })
}

/* item */
export const postItem = ({ commit }, item) => {
  commit(type.ITEMPOST, item)
}
export const deleteItem = ({ commit }, item) => {
  commit(type.ITEMDELETE, item)
}
export const starItem = ({ commit }) => { // 当前页面刷新如何
  const dev = getDev()
  if (!Star.length && !window.config[dev]) {
    commit(type.MENUACTIVE, {})
    setItem({ commit })
  } else {
    if (Star.length === 0) Star = window.config.test.split(',')
    api.axios('getItemStar', 'post', { itemId: Star, dev }, (res) => {
      setItem({ commit }, res)
      commit(type.MENUACTIVE, {})
    })
  }
}
export const __getItem = ({ commit }, params) => {
  if (!Object.keys(params).length) {
    commit(type.ITEMGET)
  } else {
    api.axios('getItemStar', 'post', params, (res) => {
      if (Star && Star.length >= 1) {
        updateStarloop(res, Star)
      }
      Store.allItem = res
      setItem({ commit }, res)
    })
  }
}
export const getItemAll = ({ commit }, cb) => {
  const dev = getDev()
  api.axios('getItemAll', 'get', { dev })
  .then((res) => {
    Store.allItem = res
    setItem({ commit }, res)
    cb && cb(res)
  })
}
export const setItem = ({ commit }, res) => {
  commit(type.ITEMGET, res)
}
export const updateItem = ({ commit }, params) => {
  const dev = getDev()
  params.dev = dev
  return api.axios('updateItem', 'patch', params)
}
export const createItem = ({ commit }, params) => {
  params.dev = getDev()
  return api.axios('createItem', 'post', params)
}
export const delItem = ({ commit }, params) => {
  params.dev = getDev()
  return api.axios('deleteItem', 'delete', params)
}

// 更新用户关注的项目 item.vue
export const patchUser = ({ commit }, params) => {
  params['dev'] = getDev()
  return api.axios('user', 'patch', params)
}

/* 查询最新上传的项目 */
export const getItemRecent = ({ commit }, cb) => {
  const dev = getDev()
  api.axios('getItemRecent', 'get', { dev }, (res) => {
    Store.allItem = res
    setItem({ commit }, res)
    commit(type.MENUACTIVE, {})
    cb && cb(res)
  })
}

// 过滤 all home
export const filterItem = ({ commit, state }, text) => {
  const item = []
  forEach(Store.allItem, (v) => {
    if (v.name.indexOf(text) >= 0 || v.folderName.indexOf(text) >= 0) {
      item.push(v)
    }
  })
  setItem({ commit }, item)
}

/* 搜索 正对 当前 和 所有项目 的检索功能 */
// export const searchItem = ({ commit, state }, params) => {
//   if (params.current && state.item.length >= 2) {
//     const arr = state.item.filter((v) => {
//       return v.filename.indexOf(params.current) >= 0
//     })
//     setItem({ commit }, arr)
//   } else if (params.all) {
//     // api.axios()
//   }
// }
