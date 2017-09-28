require('./style.css')
const base = {
  _: {},
  timer: '',
  config: {
    bg: 'rgba(000, 000, 000, 0.6)',
    name: 'scale',
    time: '4000',
    hide: false,
    text: '',
    mask: true,
    click: true,
    position: 'top'
  },
  position () {
    var position = this.config.position
    this._[position] = this.create('div', {
      id: 'fe-toast-' + position,
      cla: 'fe-toast',
      body: true
    })
  },
  list (tag, main, position) {
    var conf = this.config
    var list = this.create('span', {
      cla: 'fe-animated ' + tag,
      main: main
    })
    list.style.background = conf.bg
    if (conf.click) {
      list.addEventListener('click', () => {
        this.endAnimation(list, position, true)
      })
    }
    return list
  },
  event (list, position, endTime) {
    list.addEventListener('webkitAnimationEnd', () => {
      setTimeout(() => {
        this.endAnimation(list, position)
      }, endTime)
    })
  },
  endAnimation (list, position, type) {
    list.className = type ? 'fe-animated click' : 'fe-animated'
    list.addEventListener('webkitAnimationEnd', () => {
      if (this._[position]) this._[position].removeChild(list.parentNode)
      if (position === 'middle') this.vertical()
      this.remove(position)
    })
  },
  remove (position) {
    if (position) {
      var p = this._[position]
      if (p.children.length === 0) {
        document.body.removeChild(p)
        delete this._[position]
      }
    } else {
      for (var i in this._) {
        if (this._[i]) {
          document.body.removeChild(this._[i])
          delete this._[i]
        }
      }
    }
  },
  vertical () {
    const middle = this._['middle']
    const h = middle.offsetHeight / 2
    middle.style.transform = 'translateY(' + (-h + 'px') + ')'
  },
  create (tag, conf) {
    if (!conf) conf = {}
    const el = document.createElement(tag)
    if (conf.id) el.id = conf.id
    if (conf.cla) el.className = conf.cla
    if (conf.main) el.innerHTML = conf.main
    if (conf.body) document.body.appendChild(el)
    return el
  }
}

const Toast = Object.create(base)
Toast.render = function () {
  var conf = this.config
  var list = this.list('fe-' + conf.name, conf.text, conf.position)
  var placeholder = this.create('div')
  if (!this._[conf.position]) this.position()
  if (!this.hide) this.event(list, conf.position, conf.time)
  placeholder.appendChild(list)
  this._[conf.position].insertAdjacentElement('afterbegin', placeholder)
  if (conf.position === 'middle') this.vertical()
}

Toast.merge = function (obj, position) {
  var opt = typeof obj === 'string' ? { text: obj } : obj
  if (typeof Object.assign !== 'function') { // android
    Object.assign = (target) => {
      var has = Object.prototype.hasOwnProperty
      target = Object(target)
      for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index]
        if (source != null) {
          for (var key in source) {
            if (has.call(source, key)) {
              target[key] = source[key]
            }
          }
        }
      }
      return target
    }
  }
  Object.assign(this.config, opt, position)
}

Toast.top = function (obj) {
  this.merge(obj, { position: 'top' })
  this.render()
}

Toast.middle = function (obj) {
  this.merge(obj, { position: 'middle' })
  this.render()
}

Toast.bottom = function (obj) {
  this.merge(obj, { position: 'bottom' })
  this.render()
}

module.exports = Toast // export default
