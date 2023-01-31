const fs = require('fs')
const path = require('path')
const busboy = require('busboy')
let md5 = require('md5')
// const inspect = require('util').inspect

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
  // 默认的文件保存的目录
  let defalutPath = path.join(__dirname, '../files')
  // 默认按日期生成子目录
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
  // options的参数优先
  let dirName = options.dirName || defalutDir
  // 生成最终的路径
  let filePath = path.join(options.path || defalutPath, dirName)
  // 目录是否存在
  let mkdirResult = mkdirsSync(filePath)

  // let res = ctx.res
  let req = ctx.req
  const bb = busboy({ headers: req.headers, defParamCharset: 'utf8' })
  console.log('bb:')

  let fileCount = 0 // 一次上传的文件数量
  let urlList = [] // 上传成功的url列表

  // let result = {
  //   success: false, // 上传结果
  //   errMsg: '', // 错误信息
  //   formData: {}, // 表单信息
  // } // 整个post事件的结果

  return new Promise((resolve, reject) => {
    // 解析请求文件事件
    bb.on('file', (name, file, info) => {
      ++fileCount
      const { filename, encoding, mimeType } = info

      // 按时间戳生成文件名
      let saveName = new Date().getTime() + '.' + getSuffixName(filename)
      // 生成随机文件名
      // saveName = Math.random().toString(16).substr(2) + '.' + getSuffixName(filename)

      // 保存的路径
      let _uploadFilePath = path.join(filePath, saveName)
      let saveTo = path.join(_uploadFilePath)

      let fileSize = 0
      let content = ''

      // 文件保存到指定路径
      file.pipe(fs.createWriteStream(saveTo))
      file
        .on('data', (data) => {
          fileSize = fileSize + data.length
          content = content + data
        })
        .on('close', () => {
          // console.log(`file close:${filename}保存成功，保存的名称是${saveName}`)
          let _content = fs.readFileSync(saveTo, 'binary')

          urlList.push({
            filename: filename,
            fileSize: fileSize,
            encoding: encoding,
            mimeType: mimeType,
            saveTo: saveTo,
            url: `http://${ctx.host}/files/${dirName}/${saveName}`,
            dataMd5: md5(content),
            fileMd5: md5(_content),
          })
        })
    })

    // 解析表单中其他字段信息
    bb.on('field', (name, val, info) => {
      // console.log('bb field:', info)
      // result.formData[name] = inspect(val)
    })

    // 解析结束事件
    bb.on('close', function () {
      // console.log(`bb close:共有${fileCount}个文件`)
      resolve(urlList)
    })

    // 解析错误事件
    bb.on('error', function (err) {
      // console.log('busboy error:', err)
      // result.errMsg = inspect(err)
      reject(err)
    })

    req.pipe(bb)
  })
}

module.exports = {
  uploadFile,
}
