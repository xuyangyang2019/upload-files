class BaseDAO {
  /**
   * 构造方法
   * @param {function} model mongoose model对象，初始化时必须
   */
  constructor(model) {
    this.model = model
  }

  /**
   * 查询条数
   * @param {Object} condition 查询条件
   */
  async count(condition = {}) {
    const count = await this.model.countDocuments(condition)
    return { count: count }
  }

  /**
   * 条件查询，单个结果
   * @param {Object} condition 查询条件
   * @param {Object} fields 查询字段
   * @return {Object | null} 查询结果,为空时返回null
   */
  async findOne(condition, fields = {}) {
    const result = await this.model.findOne(condition, fields)
    return result
  }

  /**
   * 条件查询，多个结果
   * @param {Object} condition 查询条件
   * @return {Array} 查询结果
   */
  async findMany(condition, fields, sort = { _id: -1 }) {
    const result = await this.model.find(condition, fields).sort(sort)
    return result
  }

  /**
   * 按条件分页查询数据
   * @param {Object} condition 查询条件
   * @param {Object} fields 返回的字段
   * @param {Number} pageNum
   * @param {Number} pageSize
   * @param {Object} sort 排序条件
   */
  async findManyByPage(condition = {}, fields = {}, pageNum = 1, pageSize = 10, sort = { _id: -1 }) {
    const list = await this.model
      .find(condition, fields)
      .limit(parseInt(pageSize, 10))
      .skip((parseInt(pageNum, 10) - 1) * 10)
      .sort(sort)
      .exec()
    return list
  }

  /**
   * id查询
   * @param {String} id
   * @return {Object} 查询结果
   */
  async findById(id) {
    const result = await this.model.findById(id)
    return result
  }

  /**
   * id删除
   * @param {String} id
   * @return {Object} 查询结果
   */
  async deleteById(id) {
    const result = await this.model.findByIdAndRemove(id)
    return result
  }

  /**
   * id更新
   * @param {Object|Number|String} id _id
   * @param {Object} updateData 数据
   * @param {Object} options 配置项
   * @return {Object} 查询结果
   */
  async updateById(id, updateData, options) {
    const result = await this.model.findByIdAndUpdate(id, updateData, options)
    return result
  }

  /**
   * 新增
   * @param {Object} data Json数据
   * @return {Object} 新增的数据
   */
  async save(data) {
    // eslint-disable-next-line new-cap
    const instance = new this.model(data)
    const result = await instance.save()
    return result
  }

  /**
   * 批量插入数据
   * @param {Array} data 
   */
  async saveMany(data) {
    const result = await this.model.insertMany(data)
    return result
  }

  /**
   * 批量删除
   * @param {Object} condition 条件
   */
  async delete(condition) {
    const result = await this.model.deleteMany(condition)
    return result
  }

  /**
   * 批量更新
   * @param {Object} condition 条件
   * @param {Object} data 数据
   * @param {Object} options 配置项
   */
  async update(condition, data, options) {
    const result = await this.model.updateMany(condition, data, options)
    return result
  }

  /**
   * 更新第一个符合条件的数据
   * @param {Object} condition 条件
   * @param {Object} data 数据
   * @param {Object} options 配置项
   */
  async updateOne(condition, data, options) {
    const result = await this.model.updateOne(condition, data, options)
    return result
  }
}

module.exports = BaseDAO
