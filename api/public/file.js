const FileService = require('../../mongodb/services/FileService')

module.exports = {
  // 按条件查询文件记录
  'GET /api/file': async (ctx) => {
    const { page, limit, filename, startTime, endTime } = ctx.request.query

    const queryCondition = {}
    // 文件名
    if (filename) {
      // queryCondition.filename = filename
      queryCondition.filename = new RegExp(filename) // 模糊查询
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
