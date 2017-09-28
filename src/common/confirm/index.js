/*
  * Dialog 组件
  *
  *
 */
require('./style.css')
const Dialog = function (opt, callback) {
  this.config = Object.assign({
    top: '', // 自定义顶部的高度 默认单位px
    title: '', // 弹框的标题
    text: '', // 自定义内容
    type: '', // 默认alert样式
    mask: '', // 点击消失的事件
    timer: '', // 设置自动消失的时间
    parent: document.body, // 落地对象
    ready: '',
    callback: callback // 初始化事件
  }, opt)
  this.create()
  return this.config.state
}

Dialog.prototype.create = function () {
  const conf = this.config

  // 模板
  let tpl =
    '<div class="dialog_title">' + conf.title + '</div>' +
    '<div class="dialog_text">' + conf.text + '</div>' +
    '<div class="dialog_center">'
  if (conf.type === 'confirm') {
    tpl += '<a class="btn_cancel">取消</a><a class="ok">确定</a></div>'
  } else {
    tpl += '<a class="ok">OK</a></div>'
  }

  // 容器对象
  this.dialog = document.createElement('div')
  this.dialog.className = 'dialog'
  this.dialog.innerHTML = tpl

  // 设置距离顶部的距离
  if (conf.top) {
    conf.top = conf.top.toString()
    if (!conf.top.indexOf('px')) conf.top = conf.top + 'px'
    this.dialog.style = conf.top
  }

  // 遮罩对象
  this.mask = document.createElement('div')
  this.mask.className = 'dialog_mask'

  conf.parent.appendChild(this.mask)
  conf.parent.appendChild(this.dialog)

  // 遮罩事件
  if (conf.mask) {
    this.mask.addEventListener('click', this, false)
  }

  // 自动消失
  if (conf.timer) {
    setTimeout(this.remove.bind(this), conf.timer)
  }

  this.dialog.addEventListener('click', this, false)
  this.dialog.addEventListener('webkitTransitionEnd', this, false)

  setTimeout(() => {
    this.dialog.classList.add('dialog_show')
    this.mask.classList.add('dialog_mask_show')
  }, 100)

  // 初始化事件
  if (typeof conf.ready === 'function') {
    conf.ready()
  }
}

Dialog.prototype.handleEvent = function (e) {
  const cla = e.target.className
  const conf = this.config
  if (e.type === 'click') {
    if (cla === 'btn_cancel') {
      this.remove('cancel')
      this.config.state = false
    }
    // 不考虑点击确定后有验证... 然后不让关闭弹框的情况
    if (cla === 'ok') {
      this.remove('ok')
      this.config.state = true
    }
    if (cla.indexOf('mask') >= 0) {
      this.remove('cancel')
      this.config.state = false
    }
  } else if (e.type === 'webkitTransitionEnd') {  // 手机端用户输入法出现也会触发动画事件，导致关闭事件触发
    // class 判断显隐 附加判断
    if (cla.indexOf('dialog_show') === -1 && e.target.tagName.toLowerCase() !== 'textarea') {
      if (this.dialog) { // opacity transform
        conf.parent.removeChild(this.dialog)
        conf.parent.removeChild(this.mask)
        this.dialog = ''
        this.mask = ''
      }
    }
  }
}

Dialog.prototype.remove = function (key) {
  this.mask.classList.remove('dialog_mask_show')
  this.dialog.classList.remove('dialog_show')
  this.config.callback && this.config.callback(key)
}

export const Alert = (opt, cb) => {
  if (typeof opt === 'string') opt = { text: opt }
  opt.type = 'alert'
  return new Dialog(opt, cb)
}

export const Confirm = (opt, cb) => {
  if (typeof opt === 'string') opt = { text: opt }
  opt.type = 'confirm'
  return new Dialog(opt, cb)
}
