const BaseDAO = require('../baseDAO')
const UserModel = require('../models').user

class UserService extends BaseDAO {}

module.exports = new UserService(UserModel)
