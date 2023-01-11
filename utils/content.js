const path = require('path')
const fs = require('fs')

// 封装读取目录内容方法
const dir = require('./dir')

/**
 * 获取静态资源内容
 * @param  {object} ctx koa上下文
 * @param  {string} 静态资源目录在本地的绝对路径
 * @return  {string} 请求获取到的本地内容
 */
async function content(ctx, fullStaticPath, mime) {
  // 封装请求资源的完绝对径
  let reqPath = path.join(fullStaticPath, ctx.url)
  console.log(reqPath)

  // 判断请求路径是否为存在目录或者文件
  let exist = fs.existsSync(reqPath)

  // 返回请求内容， 默认为空
  let content = ''

  if (!exist) {
    // 如果请求路径不存在，返回404
    content = '404 Not Found! o(╯□╰)o！'
  } else {
    // 判断访问地址是文件夹还是文件
    let stat = fs.statSync(reqPath)

    if (stat.isDirectory()) {
      // 如果为目录，则渲读取目录内容
      // content = dir(ctx.url, reqPath)
      let contentList = fs.readdirSync(reqPath)
      let html = `<ul>`
      for (let [index, item] of contentList.entries()) {
        html = `${html}
        <li>
          <a href="${ctx.url === '/' ? '' : ctx.url}/${item}">${item}</a>
        </li>`
      }
      html = `${html}</ul>`
      content = html
    } else {
      // "utf8" | "binary" | "ascii" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "hex")
      let encoding = 'utf8' // 默认
      if (mime) {
        if (mime.startsWith('image/')) {
          encoding = 'binary'
        } else if (mime.startsWith('application/')) {
          encoding = 'binary'
        }
      }
      console.log('cotent encoding', encoding)
      content = fs.readFileSync(reqPath, encoding)
    }
  }

  return content
}

module.exports = content
