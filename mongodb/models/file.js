// 保存文件上传的信息
module.exports = {
  name: 'file',
  schema: {
    success: { type: Boolean, default: false }, // 上传结果
    message: { type: String, required: true }, // 上传结果
    url: String, // url
    saveTo: String, // 本地地址
    filename: String, // 文件名
    encoding: String, // 编码方式
    mimeType: String, // 文件类型
    fileSize: { type: Number, default: 0 }, // 文件大小
    formData: Object, // 表单信息
  },
  // 其他配置
  options: {
    timestamps: true,
  },
  // 实例方法 所有实例可用
  // methods: [
  //   {
  //     name: 'findSimilarNickName',
  //     fb: function (cb) {
  //       return mongoose.model('user').find({ nickname: this.nickname }, cb)
  //     }
  //   }
  // ],
  // 静态方法 仅model可用
  // statics: [
  //   {
  //     name: 'findByName',
  //     fb: function (name) {
  //       return this.find({ username: new RegExp(name, 'i') })
  //     }
  //   }
  // ],
  // // hook方法
  // pre: [
  //   {
  //     name: 'save', // ['updateOne', 'findOneAndUpdate']
  //     fb: function (next) {
  //       // 做些什么
  //       console.log('user pre save')
  //       next()
  //     }
  //   }
  // ]
}
