// const TagService = require('../../mongodb/services/TagService')
const path = require('path')

// 解析文件或目录
const content = require('../../util/content')
const mimes = require('../../util/mimes')

// 解析资源类型
function parseMime(url) {
  let extName = path.extname(url)
  extName = extName ? extName.slice(1) : 'unknown'
  return mimes[extName]
}

module.exports = {
  // 分页查询标签，可添加查询条件
  'GET /api/file': async (ctx) => {
    console.log('/api/file')
    // // 获取静态资源内容，有可能是文件内容，目录，或404
    // let _content = await content(ctx, __dirname)
    // // 解析请求内容的类型
    // let _mime = parseMime(ctx.url)
    // // 如果有对应的文件类型，就配置上下文的类型
    // if (_mime) {
    //   ctx.type = _mime
    // }
    // // 输出静态资源内容
    // if (_mime && _mime.indexOf('image/') >= 0) {
    //   // 如果是图片，则用node原生res，输出二进制数据
    //   ctx.res.writeHead(200)
    //   ctx.res.write(_content, 'binary')
    //   ctx.res.end()
    // } else {
    //   // 其他则输出文本
    //   ctx.body = _content
    // }

    // const { name, userName, pageNum, pageSize } = ctx.request.query
    // const queryCondition = {}
    // // 模糊查询标签名
    // if (name) {
    //   queryCondition['name'] = new RegExp(name)
    // }
    // if (userName) {
    //   queryCondition['userName'] = userName
    // }
    // // const result = await TagService.findManyByPage(queryCondition, {}, pageNum, pageSize)
    // // const total = await TagService.count(queryCondition)
    ctx.rest({ list: {}, total: 10 })
  },
}
