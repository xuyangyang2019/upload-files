const FileService = require('../../mongodb/services/FileService')

module.exports = {
  // 按条件查询文件记录
  'GET /api/file': async (ctx) => {
    const { page, limit, fileName, fileType, startTime, endTime } =
      ctx.request.query

    const queryCondition = {}
    // 文件名
    if (fileName) {
      queryCondition.filename = new RegExp(fileName) // 模糊查询
    }
    if (fileType && fileType !== 'all') {
      queryCondition.mimeType = fileType // 模糊查询
    }
    // 时间段
    if (startTime && endTime) {
      queryCondition.createdAt = { $gte: startTime, $lte: endTime }
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
}
