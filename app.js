const Koa = require('koa')
const path = require('path')
// const fs = require('fs')

const bodyParser = require('koa-bodyparser')
const static = require('koa-static')
const views = require('koa-views')
const cors = require('koa2-cors') // ajax 跨域问题
const routers = require('./routers/index')

const loggerAsync = require('./middlewares/logger-async')
const { restify } = require('./middlewares/rest') // rest中间件
const error = require('./middlewares/error') // 错误处理 和 返回处理

const log4j = require('./util/log4j')

// 解析文件或目录
const content = require('./util/content')
const mimes = require('./util/mimes')
// 解析资源类型
function parseMime(url) {
  let extName = path.extname(url)
  extName = extName ? extName.slice(1) : 'unknown'
  return mimes[extName]
}

// /**
//  * 用Promise封装异步读取文件方法
//  * @param  {string} page html文件名称
//  * @return {promise}
//  */
// function renderFun(page) {
//   return new Promise((resolve, reject) => {
//     let viewUrl = `./views/${page}`
//     fs.readFile(viewUrl, 'binary', (err, data) => {
//       if (err) {
//         reject(err)
//       } else {
//         resolve(data)
//       }
//     })
//   })
// }

const app = new Koa()

// 使用中间件

// 加载日志中间件
app.use(loggerAsync())

app.use(error) // Error Handler

// 使用ctx.body解析中间件
app.use(bodyParser())

// 加载模板引擎
const render = views(path.join(__dirname, './views'), {
  extension: 'html',
  // extension: 'ejs',
  // map: {
  //   html: 'underscore',
  // },
})
app.use(render)

// api接口
app.use(restify()) // 给ctx添加一个rest()方法

// 加载路由中间件
// const Router = require('koa-router')
// // 子路由2
// let page = new Router()
// page
//   .get('/404', async (ctx) => {
//     await ctx.render('404.html', {})
//   })
//   .get('/todo', async (ctx) => {
//     await ctx.render('todo.html', {})
//   })
// // 装载所有子路由
// let router = new Router()
// router.use('/page', page.routes(), page.allowedMethods())
// app.use(router.routes()).use(router.allowedMethods())
app.use(routers.routes(), routers.allowedMethods())

// static文件夹作为 静态资源
// 由于9.4.0时，通配符取消了，改为了正则的字符，于是*要改为"/(.*)"这样才行，不然会报错。
// router.all(
//   '/(static/*)',
//   static('./', {
//     maxage: 7 * 24 * 60 * 60 * 1000, //7天
//   })
// )
app.use(static(__dirname + '/static'), {
  //     maxage: 30 * 24 * 60 * 60 * 1000, //30天缓存周期
  //     index: 'index.html', // 默认文件
}) // http://localhost:3000/css/style.css

// 处理跨域
// 全部允许跨域
app.use(cors())
// 设置多个域名可跨域
// app.use(
//   cors({
//     origin: function (ctx) {
//       // 设置允许来自指定域名请求
//       const whiteList = ['http://xyy.life', 'http://localhost:9527'] // 可跨域白名单
//       const url = ctx.header.referer ? ctx.header.referer.substr(0, ctx.header.referer.length - 1) : ''
//       if (whiteList.includes(url)) {
//         return url // 注意，这里域名末尾不能带/，否则不成功，所以在之前我把/通过substr干掉了
//       }
//       return 'http://localhost::3000' // 默认允许本地请求3000端口可跨域
//     },
//     maxAge: 5, // 指定本次预检请求的有效期，单位为秒。
//     credentials: true, // 是否允许发送Cookie
//     allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 设置所允许的HTTP请求方法
//     allowHeaders: ['Content-Type', 'Authorization', 'Accept'], // 设置服务器支持的所有头信息字段
//     exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'] // 设置获取其他自定义字段
//   })
// )

app.use(async (ctx) => {
  // // 解析post body
  // if (ctx.url === '/' && ctx.method === 'POST') {
  //   // 当POST请求的时候，解析POST表单里的数据，并显示出来
  //   let postData = ctx.request.body
  //   ctx.body = postData
  // }

  // // 查询上传的文件
  if (ctx.url.startsWith('/upload-files') && ctx.method === 'GET') {
    // 获取静态资源内容，有可能是文件内容，目录，或404
    let _content = await content(ctx, __dirname)
    // 解析请求内容的类型
    let _mime = parseMime(ctx.url)
    // 如果有对应的文件类型，就配置上下文的类型
    if (_mime) {
      ctx.type = _mime
    }
    // 输出静态资源内容
    if (_mime && _mime.indexOf('image/') >= 0) {
      // 如果是图片，则用node原生res，输出二进制数据
      ctx.res.writeHead(200)
      ctx.res.write(_content, 'binary')
      ctx.res.end()
    } else {
      // 其他则输出文本
      ctx.body = _content
    }
  } else {
    // 其他请求显示404
    ctx.body = '<h1>404！！！ o(╯□╰)o</h1>'
  }
})

// 错误处理
app.on('error', (err, ctx) => {
  // logError(ctx, err)
  // console.log(err)
  // const logText = `${ctx.method} ${ctx.url} ${ctx.status}  `
  log4j.error(err)
})

app.listen(3001, () => {
  // console.log('[demo] upload-pic-async is starting at port 3000')
  console.log('upload-files is starting at: http://localhost:3001')
})
