module.exports = {
  // APIError: function (code, message) {
  //   this.code = code || 'internal:unknown_error'
  //   this.message = message || ''
  // },
  restify: (pathPrefix) => {
    pathPrefix = pathPrefix || '/api/'
    return async (ctx, next) => {
      // api请求绑定rest()方法:
      if (ctx.request.path.startsWith(pathPrefix)) {
        ctx.rest = (data, code, message) => {
          ctx.response.type = 'application/json'
          ctx.response.body = {
            code: code || 20000,
            msg: message || 'success',
            data: data
          }
        }
      }
      await next()
    }
  }
}
