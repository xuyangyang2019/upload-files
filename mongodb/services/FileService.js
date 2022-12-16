const BaseDAO = require('../baseDAO')
const Model = require('../models').file

class Service extends BaseDAO {}

module.exports = new Service(Model)
