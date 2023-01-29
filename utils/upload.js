const fs = require('fs')
const path = require('path')
const busboy = require('busboy')
const inspect = require('util').inspect

/**
 * 同步创建文件目录
 * @param  {string} dirname 目录绝对地址
 * @return {boolean}        创建目录结果
 */
function mkdirsSync(dirname) {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
}

/**
 * 获取上传文件的后缀名
 * @param  {string} fileName 获取上传文件的后缀名
 * @return {string}          文件后缀名
 */
function getSuffixName(fileName) {
  let nameList = fileName.split('.')
  return nameList[nameList.length - 1]
}

/**
 * 上传文件
 * @param  {object} ctx koa上下文
 * @param  {object} options 文件上传参数 fileType文件类型， path文件存放路径
 * @return {promise}
 */
function uploadFile(ctx, options = {}) {
  // 根据日期生成目录
  let nowDay = new Date()
  let yyyy = nowDay.getFullYear()
  let MM = nowDay.getMonth() + 1
  let dd = nowDay.getDate()
  if (MM < 10) {
    MM = '0' + MM
  }
  if (dd < 10) {
    dd = '0' + dd
  }
  let defalutDir = yyyy + '-' + MM + '-' + dd
  let defalutPath = path.join(__dirname, '../files')

  // 以参数目录 加 文件类型作为 保存的目录
  let fileType = options.fileType || defalutDir
  let filePath = path.join(options.path || defalutPath, fileType)
  // 目录是否存在
  let mkdirResult = mkdirsSync(filePath)

  let req = ctx.req
  let res = ctx.res

  const bb = busboy({ headers: req.headers, defParamCharset: 'utf8' })

  return new Promise((resolve, reject) => {
    let result = {
      success: false, // 上传结果
      message: '', // 上传结果
      url: '', // url
      saveTo: '', // 本地地址
      formData: {}, // 表单信息
      filename: '', // 文件名
      encoding: '', // 编码方式
      mimeType: '', // 文件类型
      fileSize: 0, // 文件大小
    }

    // 解析请求文件事件
    bb.on('file', (name, file, info) => {
      const { filename, encoding, mimeType } = info

      // result.name = name
      result = { ...result, ...info }

      // 生成随机文件名
      let saveName =
        Math.random().toString(16).substr(2) + '.' + getSuffixName(filename)

      // 保存的路径
      let _uploadFilePath = path.join(filePath, saveName)
      let saveTo = path.join(_uploadFilePath)

      result.saveTo = saveTo
      result.url = `http://${ctx.host}/files/${fileType}/${saveName}`

      // 文件保存到指定路径
      file.pipe(fs.createWriteStream(saveTo))

      file
        .on('data', (data) => {
          result.fileSize = result.fileSize + data.length
        })
        .on('close', () => {
          result.success = true
          result.message = '文件上传成功'
        })
    })

    // 解析表单中其他字段信息
    bb.on('field', (name, val, info) => {
      result.formData[name] = inspect(val)
    })

    // 解析结束事件
    bb.on('finish', function () {
      resolve(result)
    })

    // 解析错误事件
    bb.on('error', function (err) {
      result.message = inspect(err)
      reject(result)
    })

    req.pipe(bb)
  })
}

module.exports = {
  uploadFile,
}
