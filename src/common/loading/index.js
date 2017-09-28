require('./style.css')

const loading = {
  show () {
    this.loading = document.querySelector('#loading-animation')
    this.mask = document.querySelector('#mask_white')
    if (!this.mask) {
      this.mask = this.createMask()
      document.body.appendChild(this.mask)
    }

    if (!this.loading) {
      this.loading = this.createMask('loading')
      document.body.appendChild(this.loading)
    } else {
      this.mask.style.display = 'block'
      this.loading.classList.add('active')
    }
  },
  hide () {
    if (this.mask) { // 没有show执行hide会报错
      this.mask.style.display = 'none'
    }
    if (this.loading) {
      this.loading.classList.remove('active')
    }
  },
  createMask (name) {
    const el = document.createElement('div')
    if (name) {
      el.id = 'loading-animation'
      el.innerHTML = '  <div id="wrap-loading" class="wrap-loading">' +
      '    <div class="loading up"></div>' +
      '    <div class="loading down"></div>' +
      '    <div id="loading_text"></div>' +
      '  </div>'
    } else {
      el.id = 'mask_white'
    }

    return el
  }
}

export default loading
