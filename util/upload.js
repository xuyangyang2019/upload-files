const inspect = require('util').inspect
const fs = require('fs')
const path = require('path')
const busboy = require('busboy')

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
 * @param  {object} ctx     koa上下文
 * @param  {object} options 文件上传参数 fileType文件类型， path文件存放路径
 * @return {promise}
 */
function uploadFile(ctx, options) {
  // 以参数目录 加 文件类型作为 保存的目录
  let fileType = options.fileType || 'common'
  let filePath = path.join(options.path, fileType)
  // 目录是否存在
  let mkdirResult = mkdirsSync(filePath)

  let req = ctx.req
  let res = ctx.res

  const bb = busboy({ headers: req.headers })

  return new Promise((resolve, reject) => {
    console.log('文件上传中...')
    let result = {
      success: false,
      formData: {},
    }

    // 解析请求文件事件
    bb.on('file', (name, file, info) => {
      console.log('on file name:', name)
      // console.log('on file file:', file)
      console.log('on file info:', info)
      const { filename, encoding, mimeType } = info
     
      // 生成随机文件名
      let fileName =
        Math.random().toString(16).substr(2) + '.' + getSuffixName(filename)
      // 保存的路径
      let _uploadFilePath = path.join(filePath, fileName)
      let saveTo = path.join(_uploadFilePath)
      // 文件保存到制定路径
      file.pipe(fs.createWriteStream(saveTo))

      file
        .on('data', (data) => {
          console.log(`File [${name}] got ${data.length} bytes`)
        })
        .on('close', () => {
          console.log(`File [${name}] done`)
          result.success = true
          result.message = '文件上传成功'
        })
    })

    // 解析表单中其他字段信息
    bb.on('field', (name, val, info) => {
      // console.log('field name:', name)
      // console.log('field val:', val)
      // console.log('field info:', info)
      // console.log('表单字段数据 [' + name + ']: value: ' + inspect(val))
      result.formData[name] = inspect(val)
    })

    // 解析结束事件
    bb.on('finish', function () {
      console.log('finish:文件上结束')
      resolve(result)
    })

    // 解析错误事件
    bb.on('error', function (err) {
      console.log('error:文件上出错')
      reject(result)
    })

    bb.on('close', () => {
      console.log('close:Done parsing form!')
      // res.writeHead(303, { Connection: 'close', Location: '/' })
      // res.end()
    })

    req.pipe(bb)
  })
}

module.exports = {
  uploadFile,
}
