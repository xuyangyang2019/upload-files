const Koa = require('koa')
const path = require('path')

const bodyParser = require('koa-bodyparser')
const static = require('koa-static')
const views = require('koa-views')
const cors = require('koa2-cors') // ajax 跨域问题
const routers = require('./routers/index')

const loggerAsync = require('./middlewares/logger-async') // 日志中间件
const { restify } = require('./middlewares/rest') // rest中间件
const error = require('./middlewares/error') // 错误处理 和 返回处理

// 解析文件或目录
const mime = require('mime')
const content = require('./utils/content')

const app = new Koa()

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
app.use(cors()) // 全部允许跨域
// 设置多个域名可跨域
// app.use(
//   cors({
//     origin: function (ctx) {
//       // 设置允许来自指定域名请求
//       const whiteList = ['http://xyy.life', 'http://localhost:3001','http://192.168.0.119:3001'] // 可跨域白名单
//       const url = ctx.header.referer
//         ? ctx.header.referer.substr(0, ctx.header.referer.length - 1)
//         : ''
//       if (whiteList.includes(url)) {
//         return url // 注意，这里域名末尾不能带/，否则不成功，所以在之前我把/通过substr干掉了
//       }
//       return 'http://localhost::3001' // 默认允许本地请求3000端口可跨域
//     },
//     maxAge: 5, // 指定本次预检请求的有效期，单位为秒。
//     credentials: true, // 是否允许发送Cookie
//     allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 设置所允许的HTTP请求方法
//     allowHeaders: ['Content-Type', 'Authorization', 'Accept'], // 设置服务器支持的所有头信息字段
//     exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'], // 设置获取其他自定义字段
//   })
// )

// 解析文件或目录
const { uploadFile } = require('./utils/upload')
const FileService = require('./mongodb/services/FileService')

app.use(async (ctx) => {
  if (ctx.url == '/upload' && ctx.method === 'POST') {
    // 文件上传

    // 跨域问题
    ctx.set('Access-Control-Allow-Origin', '*')
    ctx.set('Access-Control-Allow-Headers', 'Content-Type')
    ctx.set('Access-Control-Allow-Methods', 'POST')

    let urlList = await uploadFile(ctx)
    console.log('upload urlList:', urlList)

    // 保存结果到数据库
    for (const result of urlList) {
      FileService.save(result)
    }

    // "bizCode": 0,
    // "msg": "success",
    // "data": {
    //     "fileSize": 102,
    //     "url": "http://103.215.36.202:14086/juliao/20221216/B262AD2E22A0ABA26C75415588740A6A.txt"
    // }

    ctx.response.type = 'application/json'
    ctx.response.body = {
      code: 20000,
      msg: 'success',
      data: urlList.length === 1 ? urlList[0] : urlList,
    }
  } else if (ctx.url.startsWith('/files') && ctx.method === 'GET') {
    // 文件下载

    // 解析请求内容的类型
    let extName = path.extname(ctx.url)
    extName = extName ? extName.slice(1) : 'unknown'
    let _mime = mime.getType(extName)

    // 获取静态资源内容，有可能是文件内容，目录，或404
    let _content = await content(ctx, __dirname, _mime)

    // 如果有对应的文件类型，
    if (_mime) {
      // 配置上下文的类型
      ctx.type = _mime

      // 用node原生res，输出二进制数据
      ctx.res.writeHead(200)
      ctx.res.write(_content, 'binary')
      ctx.res.end()

      // // 输出静态资源内容
      // if (_mime.startsWith('text/')) {
      //   // 其他则输出文本
      //   ctx.body = _content
      // } else {
      //   // 如果是图片，则用node原生res，输出二进制数据
      //   ctx.res.writeHead(200)
      //   ctx.res.write(_content, 'binary')
      //   ctx.res.end()
      // }
    } else {
      ctx.body = _content
    }
  } else {
    // 其他请求显示404
    ctx.body = '<h1>404！！！ o(╯□╰)o</h1>'
  }
})

// 错误处理
app.on('error', (err, ctx) => {
  const logText = `${ctx.method} ${ctx.url} ${ctx.status}  `
  console.log(logText, err)
})

app.listen(3001, () => {
  console.log('upload-files is starting at: http://localhost:3001')
})
