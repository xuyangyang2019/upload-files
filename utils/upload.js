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
  let defalutDir =
    nowDay.getFullYear() +
    '-' +
    (nowDay.getMonth() + 1) +
    '-' +
    nowDay.getDate()
  let defalutPath = path.join(__dirname, '../files')

  // 以参数目录 加 文件类型作为 保存的目录
  let fileType = options.fileType || defalutDir
  let filePath = path.join(options.path || defalutPath, fileType)
  // 目录是否存在
  let mkdirResult = mkdirsSync(filePath)

  let req = ctx.req
  let res = ctx.res

  console.log(req.headers)

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
      console.log('file name:', name)
      const { filename, encoding, mimeType } = info
      console.log('file filename:', filename)

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
          // console.log(`File [${name}] size: ${data.length} bytes`)
          result.fileSize = result.fileSize + data.length
        })
        .on('close', () => {
          // console.log(`File [${name}] done`)
          result.success = true
          result.message = '文件上传成功'
        })
    })

    // 解析表单中其他字段信息
    bb.on('field', (name, val, info) => {
      // console.log('field name:', name)
      // console.log('field val:', val)
      // console.log('field info:', info)
      result.formData[name] = inspect(val)
    })

    // 解析结束事件
    bb.on('finish', function () {
      // console.log('finish:文件上结束', result)
      resolve(result)
    })

    // 解析错误事件
    bb.on('error', function (err) {
      // console.log('error:文件上出错')
      result.message = inspect(err)
      reject(result)
    })

    req.pipe(bb)
  })
}

module.exports = {
  uploadFile,
}
