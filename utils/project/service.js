const { log } = require('gem-mine-helper')
const { API } = require('../../constant/core')
const axios = require('axios')

module.exports = {
  async install(data) {
    try {
      const res = await axios.post(`${API}/install`, data)
      return res.data
    } catch (e) {}
  },
  async publish(data) {
    const res = await axios.post(`${API}/publish`, data)
    return res
  },
  async update(data) {
    try {
      const res = await axios.post(`${API}/update`, data)
      return res.data
    } catch (e) {}
  },
  async getClassicList() {
    try {
      const res = await axios.get(`${API}/classic/star`)
      return res.data
    } catch (e) {
      log.error('获取推荐脚手架列表失败')
      return []
    }
  }
}
