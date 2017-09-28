require('./style.css')
const arr = []
window.arr = arr
const getOffset = (el, type) => {
  let off = el[type]
  let par = el.offsetParent
  while (par) {
    off += par[type]
    par = par.offsetParent
  }
  return off
}
const getTarget = (tar) => {
  let obj = ''
  for (let i = 0, len = arr.length; i < len; i++) {
    if (arr[i].target === tar.id) {
      // 存储节点对象 如果你的父节点丢失，也就是从页面移除掉，那么存储在对象里的dom节点 就不同于新查找出来的DOM节点
      obj = arr[i]
      break
    }
  }
  return obj
}
const tips = (tar) => { // element
  let tmp = ''
  if (typeof tar === 'string') tar = document.querySelector(tar)
  const obj = getTarget(tar)

  if (!obj) {
    const num = Math.random() + ''
    arr.push({ target: tar.id, id: 'tips' + num.slice(-6) })

    tar.addEventListener('mouseover', function (e) {
      tmp = getTarget(tar)
      if (tmp) {
        const ele = document.querySelector('#' + tmp.id)
        if (ele) {
          ele.classList.add('active')
          ele.innerHTML = tar.dataset.tips
        } else {
          const w = tar.offsetWidth / 2
          const t = getOffset(tar, 'offsetTop') + (tar.offsetHeight + 6) + 'px'
          const l = (getOffset(tar, 'offsetLeft') + w) + 'px'
          document.body.insertAdjacentHTML('beforeend', '<div id="' + tmp.id + '" class="win_tips" style="left:' + l + ';top: ' + t + '">' + tar.dataset.tips + '</div>')
          document.querySelector('#' + tmp.id).classList.add('active')
        }
      }
    })

    tar.addEventListener('mouseout', () => {
      for (let i = 0, len = arr.length; i < len; i++) {
        document.querySelector('#' + arr[i].id).classList.remove('active')
      }
    })
  }
}

module.exports = tips

// tips(document...)
