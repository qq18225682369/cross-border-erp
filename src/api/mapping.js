import request from './request'

/**
 * 获取配对列表（分页）
 */
export function getMappingList(params) {
  return request({
    url: '/mapping',
    method: 'get',
    params
  })
}

/**
 * 获取配对详情
 */
export function getMappingById(id) {
  return request({
    url: `/mapping/${id}`,
    method: 'get'
  })
}

/**
 * 保存配对
 */
export function saveMapping(data) {
  return request({
    url: '/mapping',
    method: 'post',
    data
  })
}

/**
 * 取消配对
 */
export function cancelMapping(id) {
  return request({
    url: `/mapping/${id}/cancel`,
    method: 'put'
  })
}

/**
 * 删除配对
 */
export function deleteMapping(id) {
  return request({
    url: `/mapping/${id}`,
    method: 'delete'
  })
}
