const Koa = require('koa')
const path = require('path')
const fs = require('fs')

const loggerAsync = require('./middleware/logger-async')

const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')

/**
 * 用Promise封装异步读取文件方法
 * @param  {string} page html文件名称
 * @return {promise}
 */
function render(page) {
  return new Promise((resolve, reject) => {
    let viewUrl = `./views/${page}`
    fs.readFile(viewUrl, 'binary', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

let home = new Router()
// 子路由1
home.get('/', async (ctx) => {
  let html = `
      <ul>
        <li><a href="/page/helloworld">/page/helloworld</a></li>
        <li><a href="/page/404">/page/404</a></li>
      </ul>
    `
  //   ctx.body = html
  ctx.body = await render('index.html')
})
// 子路由2
let page = new Router()
page
  .get('/404', async (ctx) => {
    ctx.body = '404 page!'
    // ctx.body = await render('404.html')
  })
  .get('/todo', async (ctx) => {
    // ctx.body = 'helloworld page!'
    ctx.body = await render('todo.html')
  })

// 装载所有子路由
let router = new Router()
router.use('/', home.routes(), home.allowedMethods())
router.use('/index', home.routes(), home.allowedMethods())
router.use('/page', page.routes(), page.allowedMethods())

// const { uploadFile } = require('./util/upload')
// const views = require('koa-views')
// const static = require('koa-static')

const app = new Koa()
// const render = views(__dirname + '/views', {
//   map: {
//     html: 'ejs',
//   },
// })

// 加载日志中间件
app.use(loggerAsync())
// 使用ctx.body解析中间件
app.use(bodyParser())
// 加载路由中间件
app.use(router.routes()).use(router.allowedMethods())

/**
 * 使用第三方中间件 start
 */
// app.use(
//   views(path.join(__dirname, './view'), {
//     extension: 'ejs',
//   })
// )
// app.use(render)

// 静态资源目录对于相对入口文件index.js的路径
// const staticPath = './static'

// app.use(static(path.join(__dirname, staticPath)))
/**
 * 使用第三方中间件 end
 */

app.use(async (ctx) => {
  console.log(ctx.url)
  console.log(ctx.method)
  if (ctx.url === '/' && ctx.method === 'POST') {
    // 当POST请求的时候，解析POST表单里的数据，并显示出来
    let postData = ctx.request.body
    ctx.body = postData
  }
  //   ctx.body = 'hello wlorld'
  //   //   if (ctx.method === 'GET') {
  //   //     let title = 'upload pic async'
  //   //     await ctx.render('index', {
  //   //       title,
  //   //     })
  //   //   } else if (ctx.url === '/api/picture/upload.json' && ctx.method === 'POST') {
  //   //     // 上传文件请求处理
  //   //     let result = { success: false }
  //   //     let serverFilePath = path.join(__dirname, 'static/image')
  //   //     // 上传文件事件
  //   //     result = await uploadFile(ctx, {
  //   //       fileType: 'album',
  //   //       path: serverFilePath,
  //   //     })
  //   //     ctx.body = result
  //   //   } else {
  //   //     // 其他请求显示404
  //   //     ctx.body = '<h1>404！！！ o(╯□╰)o</h1>'
  //   //   }
})

app.listen(3000, () => {
  console.log('[demo] upload-pic-async is starting at port 3000')
})
