const fs = require('fs')
// const mime = require('mime')

/**
 * 遍历读取目录内容（子目录，文件名）
 * @param  {string} reqPath 请求资源的绝对路径
 * @return {array} 目录内容列表
 */
function walk(reqPath) {
  let files = fs.readdirSync(reqPath)
  console.log(files)
  // return files

  let dirList = [] // 文件夹
  let fileList = [] // 文件
  for (let i = 0, len = files.length; i < len; i++) {
    let item = files[i]
    let itemArr = item.split('.')
    let itemMime =
      itemArr.length > 1 ? itemArr[itemArr.length - 1] : 'undefined'

    // let mm = mime.getType(itemMime)
    // console.log(item, itemArr, itemMime, mm)

    // if (typeof mm === 'undefined') {
    if (itemMime === 'undefined') {
      dirList.push(files[i])
    } else {
      fileList.push(files[i])
    }
  }
  return dirList.concat(fileList)
}

module.exports = walk
