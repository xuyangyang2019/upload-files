/**
 * 自动生成Model
 */

const fs = require('fs')
const path = require('path')

const mongoose = require('mongoose')
const mongo = require('../mongoDB')

// const { logInfo } = require('../../utils/log4js')

const files = fs.readdirSync(__dirname).filter((file) => file.endsWith('.js') && file !== 'index.js')
const Models = {}

// 整合models
files.forEach((file) => {
  // eslint-disable-next-line global-require
  const modelFile = require(path.join(__dirname, file))
  const schema = new mongoose.Schema(modelFile.schema, modelFile.options || {})

  // Defines a pre hook for the model.
  if (modelFile.pre && modelFile.pre.length > 0) {
    for (const hookItem of modelFile.pre) {
      schema.pre(hookItem.name, hookItem.fb)
    }
  }

  // // 添加实例方法
  // if (modelFile.methods && modelFile.methods.length > 0) {
  //   for (const methodItem of modelFile.methods) {
  //     schema.methods[methodItem.name] = methodItem.fb
  //   }
  // }

  // 添加静态方法
  if (modelFile.statics && modelFile.statics.length > 0) {
    for (const staticItem of modelFile.statics) {
      schema.static(staticItem.name, staticItem.fb)
    }
  }

  Models[modelFile.name] = mongo.model(modelFile.name, schema)
  // mongo创建集合的时候会自动变成名字的复数形式,这里可以指定name
  // Models[modelFile.name] = mongo.model(modelFile.name, schema, modelFile.name)
})

// logInfo(`Models created`, Models)

module.exports = Models
