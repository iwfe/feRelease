import { api } from './mock-data'
import Loading from '../common/loading'
let timer = null

export function axios (key, method, params, success, fail) {
  Loading.show(true)
  const opt = {
    method,
    url: api(key)
  }
  if (method === 'post' || method === 'patch' || method === 'put') {
    opt.data = params
  } else {
    opt.params = params
  }

  const promise = Axios(opt)
  .then((res) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      Loading.hide()
    }, 200)
    if (res.status !== 1) {
      fail && fail(res)
      return Promise.reject(res)
    } else {
      res = res.data
      success && success(res)
      return res
    }
  })
  return promise
}

export function postImg (params, cb) {
  const xhr = new XMLHttpRequest()
  xhr.open('POST', api('upload'))
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      cb && cb(JSON.parse(xhr.response))
    }
  }
  xhr.send(params)
}
// https://github.com/mzabriskie/axios/issues/569
/* 未验证 axios 上传 */
export function uploadZip (key, params, cb) {
  const url = api(key)
  const xhr = new XMLHttpRequest()
  xhr.open('POST', url)
  // xhr.setRequestHeader('Access-Control-Allow-Origin', '*') // 设置头就出错
  // xhr.send(params)

  xhr.upload.onprogress = (event) => {
    console.log(event)
      // var complete = (event.loaded / event.total * 100 | 0);
    console.log(event.lengthComputable)
    if (event.lengthComputable) {
      const percent = Math.floor(event.loaded / event.total * 100)
      // percentComplete = parseInt( (e.loaded / e.total * 100), 10)
      const text = document.querySelector('#loading_text')
      if (text) {
        text.innerHTML = percent + '%'
      }
    }
  }

  // xhr.onreadystatechange = (res) => {
  //   if (xhr.readyState === 4) {
  //     if (xhr.status === 200) {
  //       cb && cb(JSON.parse(xhr.responseText))
  //       setTimeout(() => {
  //         Loading.hide()
  //       }, 500)
  //     }
  //   }
  // }

  xhr.onload = (res) => {
    if (xhr.status === 200) {
      cb && cb(JSON.parse(xhr.responseText))
      Loading.hide()
    } else {
      Toast.top('上传出错')
    }
  }

  xhr.send(params) // 放这里
}

export function uploadItem (key, params, cb) {
  const url = api(key)
  const xhr = new XMLHttpRequest()
  xhr.open('POST', url)
  xhr.send(params)
  xhr.onreadystatechange = (res) => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        cb && cb(JSON.parse(xhr.responseText))
        Loading.hide()
      }
    }
  }
}

const source = Axios.CancelToken.source()
Axios.defaults.timeout = 2000
Axios.interceptors.request.use((conf) => {
  return conf
}, (err) => {
  return Promise.reject(err)
})
Axios.interceptors.response.use(function (res) {
  res = res.data
  if (res.status !== 1 && res.msg) {
    Toast.top(res.msg) // 弹提示
  }
  source.cancel('操作被用户取消')
  return res
}, (err) => {
  return Promise.reject(err)
})

/*
// 图片上传
https://github.com/mzabriskie/axios/blob/master/examples/upload/index.html
*/

// https://segmentfault.com/a/1190000008470355
// xhr.addEventListener("progress", updateProgress)
// xhr.addEventListener("load", transferComplete)
// xhr.addEventListener("error", transferFailed)
// xhr.addEventListener("abort", transferCanceled)
