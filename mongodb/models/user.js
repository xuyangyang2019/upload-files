// const mongoose = require('mongoose')

module.exports = {
  // 标名 mongoDB默认会转成复数
  name: 'user',
  // collection结构
  schema: {
    username: {
      type: String,
      required: true
    }, // 用户名
    password: {
      type: String,
      required: true
    }, // 密码
    salt: {
      type: String,
      required: true
    }, // 盐
    roles: {
      type: Array,
      required: true
    }, // 角色 admin editor visitor
    state: {
      type: Number,
      required: true
    }, // 状态 1正常 0禁用
    nickname: String, // 昵称
    avatar: String, // 头像
    phoneNum: String, // 电话号码
    description: String, // 描述
    lastLoginTime: Date // 上次登录时间
  },
  // 其他配置
  options: {
    timestamps: true
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
  statics: [
    {
      name: 'findByName',
      fb: function (name) {
        return this.find({ username: new RegExp(name, 'i') })
      }
    }
  ],
  // hook方法
  pre: [
    {
      name: 'save', // ['updateOne', 'findOneAndUpdate']
      fb: function (next) {
        // 做些什么
        console.log('user pre save')
        next()
      }
    }
  ]
}
