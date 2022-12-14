// 这个middleware处理在其它middleware中出现的异常
const log4j = require('../utils/log4j') // 日志工具

// 并将异常消息回传给客户端：{ code: '错误代码', msg: '错误信息' }
const errorHandler = async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    log4j.error(err) // 错误写入日志文件中

    const { status, name, message, code } = err
    // 保证返回状态是 200, 这样前端不会抛出异常
    ctx.status = 200 || status
    ctx.body = {
      code: code,
      name: name,
      msg: message,
    }

    // 手动释放error事件
    ctx.app.emit('error', err, ctx)
  }
}

module.exports = errorHandler
