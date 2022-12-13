const Koa = require('koa')
const path = require('path')
const loggerAsync  = require('./middleware/logger-async')

// const { uploadFile } = require('./util/upload')
// const views = require('koa-views')
// const static = require('koa-static')

const app = new Koa()
// const render = views(__dirname + '/views', {
//   map: {
//     html: 'ejs',
//   },
// })

app.use(loggerAsync())

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
  ctx.body = 'hello wlorld';

//   if (ctx.method === 'GET') {
//     let title = 'upload pic async'
//     await ctx.render('index', {
//       title,
//     })
//   } else if (ctx.url === '/api/picture/upload.json' && ctx.method === 'POST') {
//     // 上传文件请求处理
//     let result = { success: false }
//     let serverFilePath = path.join(__dirname, 'static/image')

//     // 上传文件事件
//     result = await uploadFile(ctx, {
//       fileType: 'album',
//       path: serverFilePath,
//     })
//     ctx.body = result
//   } else {
//     // 其他请求显示404
//     ctx.body = '<h1>404！！！ o(╯□╰)o</h1>'
//   }
})

app.listen(3000, () => {
  console.log('[demo] upload-pic-async is starting at port 3000')
})
