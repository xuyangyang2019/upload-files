const log4j = require('../util/log4j')

/**
 * 获取客户端ip地址
 * @param {*} ctx
 */
function getClientIp(ctx) {
  const remoteAddress =
    ctx.headers['x-forwarded-for'] ||
    ctx.ip ||
    ctx.ips ||
    (ctx.socket &&
      (ctx.socket.remoteAddress ||
        (ctx.socket.socket && ctx.socket.socket.remoteAddress)))
  return remoteAddress
}

/**
 * 是手机还是pc
 * @param {*} userAgent
 */
function isMobile(userAgent) {
  // 判断是移动端还是pc端
  return /Mobile/.test(userAgent) ? 'Mobile' : 'PC'
}

module.exports = function () {
  return async (ctx, next) => {
    const start = new Date() // 响应开始时间
    const ip = getClientIp(ctx) // 请求的ip
    const userAgent = isMobile(ctx.request.headers['user-agent']) // 电脑还是手机

    // log4j.info(`get: ${JSON.stringify(ctx.request.query)}`) // 监听get请求
    // log4j.info(`params: ${JSON.stringify(ctx.request.body)}`) // 监听post请求
    await next()
    const execTime = new Date() - start + 'ms' // 响应间隔时间
    const logText = `${ip} ${userAgent} ${ctx.method} ${ctx.url} ${ctx.status} ${execTime}`
    // 调试日志
    log4j.debug(logText)
  }
}
