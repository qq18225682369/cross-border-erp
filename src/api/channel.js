import request from './request'

/**
 * 获取启用的渠道列表
 */
export function getActiveChannels() {
  return request({
    url: '/channels/active',
    method: 'get'
  })
}

/**
 * 获取渠道列表
 */
export function getChannelList() {
  return request({
    url: '/channels',
    method: 'get'
  })
}

/**
 * 添加渠道
 */
export function addChannel(data) {
  return request({
    url: '/channels',
    method: 'post',
    data
  })
}

/**
 * 更新渠道
 */
export function updateChannel(id, data) {
  return request({
    url: `/channels/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除渠道
 */
export function deleteChannel(id) {
  return request({
    url: `/channels/${id}`,
    method: 'delete'
  })
}
