const router = require('koa-router')()

// 客户端页面
router.get(
  [
    '/',
    '/index',
    // '/article/:tag',
    // '/article/:tag/:id',
    // '/placeOnFile/*',
  ],
  async (ctx) => {
    await ctx.render('index', {
      title: 'file upload',
    })
  }
)

module.exports = router
