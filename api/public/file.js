// const TagService = require('../../mongodb/services/TagService')

module.exports = {
  // 分页查询标签，可添加查询条件
  'GET /api/file/list': async (ctx) => {
    const { name, userName, pageNum, pageSize } = ctx.request.query
    const queryCondition = {}
    // 模糊查询标签名
    if (name) {
      queryCondition['name'] = new RegExp(name)
    }
    if (userName) {
      queryCondition['userName'] = userName
    }
    // const result = await TagService.findManyByPage(queryCondition, {}, pageNum, pageSize)
    // const total = await TagService.count(queryCondition)
    ctx.rest({ list: {}, total: 10 })
  }
}
