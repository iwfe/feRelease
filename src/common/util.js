// 延迟
export const delay = (() => {
  let timer = null
  return (cb, time) => {
    clearTimeout(timer)
    timer = setTimeout(cb, time)
  }
})()

// 计算个数
export const computedWidth = (num) => {
  const n = num - 1
  const w = window.innerWidth - 324 - n * 20
  const sw = w / num
  return parseInt(sw) + 'px'
}

// profile 点击事件
export const setProfile = (cb, e) => {
  const w = window.innerWidth - 375
  const x = e.clientX
  if (x <= w) {
    document.removeEventListener('click', setProfile)
    cb && cb()
  }
}

// 锁住屏幕
export const lock = (e) => {
  e.preventDefault()
  e.stopPropagation()
}

export const forEach = (obj, cb) => {
  if (!obj || typeof obj === 'undefined') return
  if (typeof obj !== 'object' && Array.isArray(obj)) obj = [obj]
  if (Array.isArray(obj)) {
    for (let i = 0, len = obj.length; i < len; i++) {
      cb(obj[i], i, obj)
    }
  } else {
    for (const key in obj) {
      cb(obj[key], key, obj)
    }
  }
}

export const merge = () => {
  const result = {}
  const assignValue = (val, key) => {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge(result[key], val)
    } else {
      result[key] = val
    }
  }
  for (let i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue)
  }
  return result
}

// 存储
export const setData = (name, obj) => {
  if (typeof obj !== 'string' && typeof obj !== 'object') return
  if (typeof obj === 'object') obj = JSON.stringify(obj)
  localStorage.setItem(name, obj)
  return obj
}

// 获取
export const getData = (name) => {
  const obj = localStorage.getItem(name)
  if (obj) return (obj.charAt(0) === '{' || obj.charAt(0) === '[') ? JSON.parse(obj) : obj
}

// 循环处理 高亮项目
export const updateStarloop = (item, star) => {
  forEach(star, (val) => {
    forEach(item, (v) => {
      if (v.id.toString() === val.toString()) {
        v.star = 1
      }
    })
  })
  // for (let i = 0, len = item.length; i < len; i++) {
  //   for (let j = 0; j < star.length; j++) {
  //     if (item[i].id === star[j]) {
  //       item[i].star = 1
  //       break
  //     }
  //   }
  // }
}

// 获取环境标识
export const getDev = () => {
  if (location.search) {
    const params = new URLSearchParams(location.search.slice(1))
    return params.get('dev')
  } else {
    return getData('dev')
  }
}

// 是否有新项目，过滤排除all
export const filterNewItem = (newMenu) => {
  let lock = false
  const dev = getDev()
  const oldMenu = getData('menu_data') // 过滤 all
  if (!oldMenu) {
    lock = true
  }
  if (newMenu.length >= 1) {
    forEach(newMenu, (v, i) => {
      // 初始化 都标识为新的菜单
      if (lock) {
        v['new'] = 1
      } else {
        if (v[dev]) {
          if (!oldMenu[i]) { // 新建菜单
            v['new'] = 1
          } else if (v[dev].join('') !== oldMenu[i][dev].join('')) {
            v['new'] = 1
          }
        }
      }
    })
  }
}

