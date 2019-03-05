const { API } = require('../../constant/core')
const axios = require('axios')

module.exports = {
  async install(data) {
    try {
      const res = await axios.post(`${API}/install`, data)
      return res.data
    } catch (e) {}
  },
  async update(data) {
    try {
      const res = await axios.post(`${API}/update`, data)
      return res.data
    } catch (e) {}
  }
}
