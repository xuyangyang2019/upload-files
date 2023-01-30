// 解析文件或目录
const { uploadFile } = require('../../utils/upload')
const FileService = require('../../mongodb/services/FileService')

module.exports = {
  // 文件上传接口
  'POST /api/upload': async (ctx) => {
    // 上传的跨域问题
    ctx.set('Access-Control-Allow-Origin', '*')
    ctx.set('Access-Control-Allow-Headers', 'Content-Type')
    ctx.set('Access-Control-Allow-Methods', 'POST')

    // 上传文件请求处理
    let result = { success: false }
    // 上传文件事件
    result = await uploadFile(ctx)
    console.log(result)

    // 保存结果到数据库
    FileService.save(result)

    // "bizCode": 0,
    // "msg": "success",
    // "data": {
    //     "fileSize": 102,
    //     "url": "http://103.215.36.202:14086/juliao/20221216/B262AD2E22A0ABA26C75415588740A6A.txt"
    // }

    ctx.rest(result)
  },
}
