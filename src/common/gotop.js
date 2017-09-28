const goTop = () => {
  const btn = document.createElement('div')
  btn.id = 'gotop'
  btn.addEventListener('click', () => {
    window.scrollTo(0, 0)
  })
  btn.innerHTML = 'top'

  document.body.insertAdjacentElement('afterbegin', btn)

  window.addEventListener('scroll', () => {
    const top = window.scrollY
    if (top > 20) {
      btn.classList.add('active')
    } else {
      btn.classList.remove('active')
    }
  })
}

module.exports = goTop
