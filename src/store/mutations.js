import * as type from './mutations-types'

const mutations = {
  [type.MENUGET] (state, arr) {
    if (!arr) arr = []
    state.menu = arr
  },
  [type.MENUADD] (state, arr) {
    state.menu = state.menu.concat(arr)
  },
  [type.MENUACTIVE] (state, obj) {
    if (!obj) obj = {}
    state.menuactive = obj
  },
  [type.MENUDEL] (state, obj) {
    state.menu.splice(state.menu.indexOf(obj), 1)
  },
  [type.ITEMGET] (state, arr) {
    if (!arr) arr = []
    state.item = arr
  },
  [type.ITEMPOST] (state, arr) {
    if (arr !== null) {
      state.item = state.item.concat(arr)
    }
  },
  [type.ITEMDELETE] (state, item) {
    if (item) {
      state.item.splice(state.item.indexOf(item), 1)
    } else {
      state.item = []
    }
  }
}

export default mutations
