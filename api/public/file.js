const FileService = require('../../mongodb/services/FileService')
const fs = require('fs')

module.exports = {
  // 按条件查询文件记录
  'GET /api/file': async (ctx) => {
    // 跨域问题
    ctx.set('Access-Control-Allow-Origin', '*')
    ctx.set('Access-Control-Allow-Headers', 'Content-Type')
    ctx.set('Access-Control-Allow-Methods', 'GET')
    
    const { page, limit, fileName, fileType, startTime, endTime } =
      ctx.request.query

    const queryCondition = {}
    // 文件名
    if (fileName) {
      queryCondition.filename = new RegExp(fileName) // 模糊查询
    }
    // 文件类型
    if (fileType && fileType !== 'all') {
      queryCondition.mimeType = new RegExp(fileType) // 模糊查询
    }
    // 时间段
    if (startTime && endTime) {
      queryCondition.createdAt = {
        $gte: startTime,
        $lt: Number(endTime) + 24 * 3600 * 1000,
      }
    }
    const result = await FileService.findManyByPage(
      queryCondition,
      { __v: 0 },
      page,
      limit,
      {
        createdAt: -1,
      }
    )
    const total = await FileService.count(queryCondition)
    ctx.rest({ list: result, total: total.count })
  },
  // 删除文件记录
  'DELETE /api/file/:id': async (ctx) => {
    const { id } = ctx.params
    // 物理删除文件
    const fileRecord = await FileService.findById(id)
    if (fileRecord._id && fileRecord.saveTo) {
      // 文件是否存在
      let exist = fs.existsSync(fileRecord.saveTo)
      if (exist) {
        // 删除本地文件
        fs.unlinkSync(fileRecord.saveTo)
      }
    }
    // 删除数据库中的记录
    const result = await FileService.delete({ _id: id })
    ctx.rest(result)
  },
}
