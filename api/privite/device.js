// const DeviceService = require('../../services').DeviceService
const DeviceService = require('../../mongodb/services/DeviceService')

module.exports = {
  // 分页查询设备，可添加查询条件
  'GET /api/device/list': async (ctx) => {
    const { page, limit, imei, activationCode, username } = ctx.request.query
    const queryCondition = {}
    if (imei) {
      queryCondition.imei = new RegExp(imei)
    }
    if (activationCode) {
      queryCondition.activationCode = new RegExp(activationCode)
    }
    if (username) {
      queryCondition.username = new RegExp(username)
    }
    const result = await DeviceService.findManyByPage(queryCondition, { salt: 0, _id: 0, password: 0 }, page, limit)
    const total = await DeviceService.count(queryCondition)
    ctx.rest({ list: result, total: total.count })
  },
  // 更新设备
  'PUT /api/device': async (ctx) => {
    const { imei, activationCode, username, state } = ctx.request.body
    const result = await DeviceService.update(
      { imei: imei },
      { activationCode: activationCode, username: username, state: state },
      {}
    )
    ctx.rest(result)
  },

  // 获取全部设备
  'GET /api/device': async (ctx) => {
    const users = await DeviceService.findMany({}, { salt: 0, _id: 0, password: 0 })
    ctx.rest(users)
  },
  // 查询设备
  'GET /api/device/one': async (ctx) => {
    const { imei } = ctx.request.query
    const result = await DeviceService.findOne({ imei: imei })
    ctx.rest({ exist: !!result })
  },
  // 添加设备
  'POST /api/device': async (ctx) => {
    const deviceInfo = ctx.request.body
    const isExist = await DeviceService.findOne({ imei: deviceInfo.imei })
    if (isExist) {
      ctx.rest(null, -1, '设备已经存在！')
    } else {
      const result = await DeviceService.save(deviceInfo)
      ctx.rest(result)
    }
  },
  // 删除单个设备
  'DELETE /api/device/:name': async (ctx) => {
    const { name } = ctx.params
    const result = await DeviceService.delete({ username: name })
    ctx.rest(result)
  },
  // 批量删除设备
  'DELETE /api/device': async (ctx) => {
    const { devices } = ctx.request.query
    if (Array.isArray(devices)) {
      const result = await DeviceService.delete({ imei: { $in: devices } })
      ctx.rest(result)
    } else if (typeof devices === 'string') {
      const result = await DeviceService.delete({ imei: devices })
      ctx.rest(result)
    } else {
      // throw new InvalidQueryError()
      ctx.throw(400, '无效的参数', { code: 'device:invalid_parameter', data: {} })
    }
  }
}
