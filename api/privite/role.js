const md5 = require('md5')
const { randomStr } = require('../../utils/random')
const { decodeToken } = require('../../utils/jwt')

const UserService = require('../../mongodb/services/UserService')

function isAdmin(ctx) {
  const token = ctx.request.headers.authorization ? ctx.request.headers.authorization.slice(7) : ''
  if (token) {
    const { roles } = decodeToken(token)
    return roles && roles.includes('admin')
  }
  return false
}

/**
 * 只有admin 能进行角色相关的操作
 */
module.exports = {
  // // 获取全部的角色
  // 'GET /api/role': async (ctx) => {
  //   const users = await UserService.findMany({}, { salt: 0, _id: 0, password: 0 })
  //   ctx.rest(users)
  // },
  // 分页查询角色，可添加查询条件
  'GET /api/role/list': async (ctx) => {
    if (!isAdmin(ctx)) {
      ctx.rest({ list: [], total: 0 })
      return
    }
    const { pageNum, pageSize, ...condition } = ctx.request.query
    // 查询admin之外的角色
    let queryCondition = {
      roles: { $nin: ['admin'] }
    }
    if (condition) {
      // 模糊查询用户名
      if (condition.username) {
        // 如果仅仅查询用户名
        // queryCondition.username = new RegExp(queryCondition.username)
        // 如果要模糊查询用户名或昵称
        queryCondition = {
          $or: [{ username: new RegExp(condition.username) }, { nickname: new RegExp(condition.username) }]
        }
      }
    }
    const result = await UserService.findManyByPage(queryCondition, { salt: 0, password: 0 }, pageNum, pageSize)
    const total = await UserService.count(queryCondition)

    ctx.rest({ list: result, total: total.count })
  },
  // 添加角色
  'POST /api/role/create': async (ctx) => {
    if (!isAdmin(ctx)) {
      // ctx.rest({ list: [], total: 0 })
      ctx.throw(403, { code: 40003, message: '你没有权限添加角色!' })
      return
    }
    const user = ctx.request.body
    const isExist = await UserService.findOne({ username: user.username })
    if (isExist) {
      ctx.rest(null, -1, '用户名已经存在！')
    } else {
      user.salt = randomStr(5)
      user.password = md5(user.password + user.salt)
      const result = await UserService.save(user)
      // 返回的数据
      const resData = {}
      const resultDoc = result._doc || {}
      for (const key in resultDoc) {
        if (Object.hasOwnProperty.call(resultDoc, key)) {
          if (key !== 'password' && key !== 'salt') {
            resData[key] = resultDoc[key]
          }
        }
      }
      ctx.rest(resData)
    }
  },
  // 根据ID删除角色
  'DELETE /api/role/:id': async (ctx) => {
    if (!isAdmin(ctx)) {
      ctx.throw(403, { code: 40003, message: '你没有权限删除该角色' })
      return
    }
    const { id } = ctx.params
    const result = await UserService.delete({ _id: id })
    ctx.rest(result)
  },
  // 查询用户名是否存在
  'GET /api/role/:name': async (ctx) => {
    if (!isAdmin(ctx)) {
      ctx.throw(403, { code: 40003, message: '你没有权限查询' })
      return
    }
    const { name } = ctx.params
    // if (name) {
    const result = await UserService.findOne({ username: name })
    ctx.rest({ exist: !!result })
    // } else {
    //   ctx.throw(403, { code: 40003, message: '缺少必要的查询参数' })
    // }
  },
  // 更新角色
  'PUT /api/role': async (ctx) => {
    if (!isAdmin(ctx)) {
      ctx.throw(403, { code: 40003, message: '你没有权限修改角色' })
      return
    }
    const { _id } = ctx.request.body
    const result = await UserService.update({ _id: _id }, ctx.request.body, {})
    ctx.rest(result)
  }
}
