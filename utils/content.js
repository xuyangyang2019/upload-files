const fs = require('fs')
const path = require('path')

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
      let contentList = fs.readdirSync(reqPath)
      // for (let [index, item] of contentList.entries()) {}
      for (const contentItem of contentList.sort()) {
        content = `${content}
        <li>
          <a href="${
            ctx.url === '/' ? '' : ctx.url
          }/${contentItem}">${contentItem}</a>
        </li>`
      }
      content = `<ul>${content}</ul>`
    } else {
      // 如果是文件
      // "utf8" | "binary" | "ascii" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "hex")
      if (mime) {
        content = fs.readFileSync(reqPath, 'binary')
        // if (mime.startsWith('text/')) {
        //   content = fs.readFileSync(reqPath, 'utf8')
        // } else {
        //   content = fs.readFileSync(reqPath, 'binary')
        // }
      } else {
        content = fs.readFileSync(reqPath)
      }
    }
  }

  return content
}

module.exports = content
