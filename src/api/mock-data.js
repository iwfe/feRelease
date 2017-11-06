/*
  接口 和 静态数据 汇总
  http://wiki.superjia.com/confluence/pages/viewpage.action?pageId=11159440
  hims_test库
  iw_static_project
  iw_static_resource
*/

export const api = (key) => {
  // const root = window.config.siteUrl
  return root + {
    signout: 'signout', // 注销
    signin: 'signin', // 登录 原始表单
    signup: 'signup', // 注册
    log: 'app/logger', // get post
    user: 'app/user', // patch 用户关注项目列表
    menu: 'app/menu', // 查询菜单
    addDev: 'app/addDev', // 项目id添加带菜单dev中，用于在菜单列表下新建项目
    open: 'app/openUpoad', // 开启
    upload: 'app/uploadItem', // 项目上传
    pushMessage: 'app/pushMsg', // 推送上传项目的消息
    getItemStar: 'app/getItemStar', // 关注列表
    getItemRecent: 'app/getItemRecent', // 最近9条数据
    getItemAll: 'app/getItemAll', // 全部项目
    updateItem: 'app/updateItem', // 更新
    createItem: 'app/createItem', // 新建
    deleteItem: 'app/deleteItem' // 删除
  }[key]
}

// first menu
export const all = {
  path: 'all',
  name: '全部项目',
  ico: 'more'
}

// menu ico
export const icon = [{
  path: 'javascript',
  ico: 'orange',
  des: 'js'
}, {
  path: 'video',
  ico: 'blue',
  des: 'vi'
}, {
  path: 'java',
  ico: 'purple',
  des: 'ja'
}, {
  path: 'mysql',
  ico: 'black',
  des: 'd1'
}, {
  path: 'mongodb',
  ico: 'black',
  des: 'dv2'
}, {
  path: 'redis',
  ico: 'black',
  des: 'dv3'
}]

export const cdn = [
  {
    key: 1,
    val: 'files.iwjw.com '
  }, {
    key: 2,
    val: 'files.fyb365.com'
  }, {
    key: 3,
    val: 'resource.iwjw.com'
  }
]

/* 环境地址 */
export const staticUrl = {
  dev: 'http://192.168.1.75:8150',
  test: 'http://192.168.1.75',
  beta: 'http://121.41.34.206:8150',
  prod: 'http://121.43.144.46'
}

export const loadUrl = {
  autoUpload: '/resource/autoUpload.do', // 上传静态 post
  openAuto: '/resource/openAuto.do' // 开启同步 get
}

/* 项目数据 */
export const app = {
  test: [{
    id: 25,
    name: 'iwjw-wxent',
    version: ''
  }]
}
export const Store = {} // 临时存储
export const footer = '@2017 iwjw'
export const dividing = '我也是有底线的'
export const img = '//cdn2.jianshu.io/assets/default_avatar/13-394c31a9cb492fcb39c27422ca7d2815.jpg'
export const data = [
  [
    'assets/signin/scene-Qqkzy9k7Eo.mp4',
    'assets/signin/scene-Qqkzy9k7Eo.m4a',
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD//gAPTGF2YzU2LjYwLjEwMP/bAEMAAwICAwICAwMDAwQDAwQFCAUFBAQFCgcHBggMCgwMCwoLCw0OEhANDhEOCwsQFhARExQVFRUMDxcYFhQYEhQVFP/bAEMBAwQEBQQFCQUFCRQNCw0UFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFP/AABEIACQAQAMBIgACEQEDEQH/xAAbAAACAwEBAQAAAAAAAAAAAAAABwUGCAMBBP/EADMQAAEDBAADBQUIAwAAAAAAAAECAwQABQYRBxIhCBMxMkEUIiMzUSRCQ1NhYnGRY4Gh/8QAGAEBAQEBAQAAAAAAAAAAAAAABQYHBAj/xAAkEQACAgEEAgEFAAAAAAAAAAABAwAEBQIGETMTFCMiJDEyQ//aAAwDAQACEQMRAD8Axtj0VaUtuM+/r7tODFstjt9wzOaUE+Xm14UqcZCozo5tpHr/ADTDQ5EcaTop3R+N3Fcw7ft9ckbuKr3l+Nkedqw1m7xUyIxS6hXUKR6VKscOlEj4Z3S14b509iUpDqFl2KVe+yrwIrWGKZliOQWVdxVMai90jmdbcOiP4rc8dvdN1YOr95mF3bNisz4vrXFdE4ckfhn+qmofD87A7uqxxJ7UNmx15xmwstyynp3ivWk+e2PkdvvPtq0MGNrXs/L0pJm4yZyL27YbNRReHJcHyz/VVzMbBZcca5rpNjwx/kWAaznlfb6yqZFUzbYseHsa50DrWaM84o5DnU9yVdLk/JcUd6Kzof6qfbudquuMUtoa29svdpdQpWvGrIyzoBfL/wBpdWbI2IvvrSTU2vPO90G2a88eq1zPjmyeuB2RkWx1oBKBok+gNPvAOFrd8xqTImKEdxSPhNleuasw41mMS2LEiShC3fFKfpV7a7Qb7KEoQ7yJHQAGtNxGBAX5Hs4kpeuFbPFXXIXiXjLuNT3UPQ0J0Top2aVk8svu8ojBavpo05ZvGGLfU8s5tt8/vG64wL/jabgiV7AyXAPDXSqhmOB62Q5dkq7FxB3Itwwea3gD9Umq3LnxgT9lbFbGN5xS9MlEi2RjseISKU2c8JbJcZK5FtfTHQevdgbo2zh3/wAzEq2R0DsiSYUdjrUil5YA0aKKmMcBKC4TPDMd35q5Ga9vzmiiqDkwzidWbjIB89ScW6SfzDRRXYomc5AkpEvUsHo6a+xy+TNfONFFLgnj8w/gT//Z',
    'assets/signin/scene-bg-Qqkzy9k7Eo.jpg'
    // 'http://cdn.calm.com/images/scene-bg-Qqkzy9k7Eo.jpg?v=1418162241210'
  ], [
    'assets/signin/scene-fire.mp4',
    'assets/signin/scene-fire.m4a',
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD//gAPTGF2YzU2LjYwLjEwMP/bAEMAAwICAwICAwMDAwQDAwQFCAUFBAQFCgcHBggMCgwMCwoLCw0OEhANDhEOCwsQFhARExQVFRUMDxcYFhQYEhQVFP/bAEMBAwQEBQQFCQUFCRQNCw0UFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFP/AABEIACQAQAMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAABQgDBAYCCf/EAC0QAAAGAQIDBQkAAAAAAAAAAAABAgMEBREGEgcTMQgiIzJBITNCUVJhcZGh/8QAGAEBAQEBAQAAAAAAAAAAAAAAAAUEAQP/xAAhEQACAQMDBQAAAAAAAAAAAAAAAwIBBBMFETMSIzEyUv/aAAwDAQACEQMRAD8A+X4AHQABv1tLPt3NkKM7IX9LaDUf8GeBXNrY5y1eb4Rbfsra/wBKcP5EBk4jFhbT17T3JLwiI/XIw3F3j44FRFnkp3CoVpp+wplkmdDdiKP2kTqDTn9iPF8e2LqXTvF+waar65mnmwD5RukkiQ8WOuSFNb/Sh07K1ud1fp8jHEXcGeTrNPmpeQ5gAAbyUAACAEiUs1RWkF3dueg910mbCkIfim4l1PlUnORqsy0N4yjI6Oh1hHrXPEjpWX3IZG1nD0gV1Y58jNjHI1dePtrZfeecbWeTJeRis7t6xi8t7dhCCItx5Enc61izvcxUtn+BzEq0TJzksDMvf4PVrIUptk6yPAD6gKhDAAAAAAAAAAAAAAA//9k=',
    'assets/signin/scene-bg-OE6oKvgzM.jpg'
    // 'http://cdn.calm.com/images/scene-bg-OE6oKvgzM.jpg?v=1450781109293'
  ], [
    'assets/signin/scene-rain.mp4',
    'assets/signin/scene-rain.m4a',
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD//gAPTGF2YzU2LjYwLjEwMP/bAEMAAwICAwICAwMDAwQDAwQFCAUFBAQFCgcHBggMCgwMCwoLCw0OEhANDhEOCwsQFhARExQVFRUMDxcYFhQYEhQVFP/bAEMBAwQEBQQFCQUFCRQNCw0UFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFP/AABEIACQAQAMBIgACEQEDEQH/xAAcAAACAgMBAQAAAAAAAAAAAAAEBQAGAwcIAQL/xAAtEAABAwMCBQMDBQEAAAAAAAABAgMEAAURBhIHEyExUSJBYRQjcRUWMlKBof/EABkBAQEAAwEAAAAAAAAAAAAAAAMAAQQFAv/EABsRAQEAAwADAAAAAAAAAAAAAAADARETIzEy/9oADAMBAAIRAxEAPwDjfXnDCZp1KpRb5MN1wpZbWcmqvYrtO0veEN42KI2kjqoA+K7Kf4fN8VlNMOSERVR8qSt44Sn5rl7iTpePpbV62or6prbThQqSoYS4od8fFajkTr0Ita2V4XISUIcWiQnegr6rJ96RRLLIeSHXPQjOCpVXBDkt7UcSXJYcRGSAPSCRt81adYcNXnIUJy1vGeJfrQ1HGSfyPNR94ayQlqCgtFlLildd4pxpWFi4crll1p0jcyOmSe1MU2VfM5Mu0vRxHTsWeygfJrd/BPg+m9iO+wUPvk4SFePJ/FTzSikW2zhrVrUQRSgNI2qQrqBnuDTL9kufXyn3Wy1GZ6oCfc1vVfCCfpjVyru7FE2EFDnKb6pJHzT/AFTpC3XCW1cH3P0q0TkHljHUEfFXNz+iqaelsssOKeUUK7Y80t1bwjia8kxpbqkR4bSTtabGOvk1nkSmXGQWEDf/AFpzC1CtERDTicp2/wAU0VPYQnDzSNusGkLzZ7tFizVLJEV91IK0p8CjuHVmhaJJdeT9ttSi2vaCUg+KDubz8cJdUypoKG5GfcVngu/XxvvSEtJ8qpWd5a115e4StQXadHil5YQdwWnCTRnC3WrJUhuMhUGSoZU2noP8ovX1uVLioZhttqUpX3FgY3CgrNp5u2liRsw4gYSsD/hozb8bcM3Wtwat5tzSuTGeT60Zzn5oPU2pBLsFqgSWcrjHKFE5BHjFUuLKkyFnOXAn38U0Zk2d+1SW3S6ueMFo56DzWyAmkrLEdtxHRVAxLi+ZavXUqUaOZNwkS2wh1wqSBgCvJDYZ+k25wruKlSsUTNJjNvRX3VDCkEYA7V9OTFG2NNbEbU9R6eualSqnwix1xTbo2HZu74oEnlS1bfepUpZJ/9k=',
    'assets/signin/scene-bg-nGWcJdvlQ2.jpg'
    // 'http://cdn.calm.com/images/scene-bg-nGWcJdvlQ2.jpg?v=1418162808152'
  ], [
    'assets/signin/scene-beach.mp4',
    'assets/signin/scene-beach.m4a',
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD//gAPTGF2YzU2LjYwLjEwMP/bAEMAAwICAwICAwMDAwQDAwQFCAUFBAQFCgcHBggMCgwMCwoLCw0OEhANDhEOCwsQFhARExQVFRUMDxcYFhQYEhQVFP/bAEMBAwQEBQQFCQUFCRQNCw0UFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFP/AABEIACQAQAMBIgACEQEDEQH/xAAZAAACAwEAAAAAAAAAAAAAAAAFBgAHCAT/xAAtEAAABgEDAgQFBQAAAAAAAAAAAQIDBAURBxIhInEGMUFRExQjQoIyU4GRof/EABkBAQADAQEAAAAAAAAAAAAAAAUBAwYEB//EACQRAAIBAwMDBQAAAAAAAAAAAAADAQIEEQUTFRQhUyIxMlRj/9oADAMBAAIRAxEAPwDSECuByHWnxwOKvnRjx1kGSvmxuOsh5uzVKDcL05h0Q6c1Y4BRvw/jkdNdNYPBZIOdZWMy2iPJDi5LqWbdBU2Kbb5lfvUYFTKcyzwLKuIbMFJnuIJljZxyM+shVyu0zaYWrX1MZWJsytwRgBMruQ22FnGL7yC/PtIv7hBFeqUE8cwz9V+N7Xf9RC09jDLF1DlMt9aZH4lkZgi6w2p+rYNwNY7JOMk2ruNAy1V4ylbWeQ0hF1ceSpBJRK/ksBzp9c5TDOEqlJ2l3GY6fWVa3C+NBZdFn+E9faupMzeoY7+S9eQIxS1M7IFVqrYvv6yyp2tMqwQra44ZJ89wQrvVmY2TiyM/7C74j10hSnHHWKhhjd9iSFeXetzSDMvkGE9yEotlzOZQWOVFNPavA12usto6vY2r/DMCHtSrh79Zq/EjFe2mtxNoNxEWOhPvtILEvXZbp9LrKOxEH120fXAWT+5WqrB9ptO1WOQRTZSDeT1+hCCB6QqB5o3FGkjzyaQagzHSM+r3EEAjfc1qZxC8HBdznUxTcJWFZ8xX9nYPuNG4peVZwIIOq2D76RamSnDeU2asoMvIDHkoSxkkJzn2EEC+TKNP/9k=',
    'assets/signin/scene-bg-HKceZ4c2nt.jpg'
    // 'http://cdn.calm.com/images/scene-bg-HKceZ4c2nt.jpg'
  ]
]

