import request from './request'

/**
 * 获取启用的国家列表
 */
export function getActiveCountries() {
  return request({
    url: '/countries/active',
    method: 'get'
  })
}

/**
 * 获取所有国家列表
 */
export function getCountryList() {
  return request({
    url: '/countries',
    method: 'get'
  })
}

/**
 * 添加国家
 */
export function addCountry(data) {
  return request({
    url: '/countries',
    method: 'post',
    data
  })
}

/**
 * 更新国家
 */
export function updateCountry(id, data) {
  return request({
    url: `/countries/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除国家
 */
export function deleteCountry(id) {
  return request({
    url: `/countries/${id}`,
    method: 'delete'
  })
}
