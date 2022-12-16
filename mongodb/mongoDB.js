const mongoose = require('mongoose')
const log4j = require('../utils/log4j')

// const url = `mongodb://${config.user}:${config.pwd}@${config.host}:${config.port}/${config.db}`
const url = `mongodb://127.0.0.1:27017/fileUpload`

// 创建一个数据库连接
// const mongo = mongoose.createConnection(url, { useNewUrlParser: true, useUnifiedTopology: true })
const mongo = mongoose.createConnection(url)

mongo.on('connected', () => log4j.info(`Connected to database: ${url}`))

mongo.on('error', (err) => {
  log4j.error(err)
  logError(null, `Failed to connect to database: ${url}:${err}`)
})

mongo.on('disconnected', () => log4j.info(`Closed connection to database: ${url}`))

mongo.once('open', () => log4j.info('MongoDB is opened'))

module.exports = mongo
