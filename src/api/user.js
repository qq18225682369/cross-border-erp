import request from './request'

/**
 * 获取用户列表
 */
export function getUserList() {
  return request({
    url: '/users',
    method: 'get'
  })
}

/**
 * 添加用户
 */
export function addUser(data) {
  return request({
    url: '/users',
    method: 'post',
    data
  })
}

/**
 * 更新用户
 */
export function updateUser(id, data) {
  return request({
    url: `/users/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除用户
 */
export function deleteUser(id) {
  return request({
    url: `/users/${id}`,
    method: 'delete'
  })
}

/**
 * 修改用户状态
 */
export function updateUserStatus(id, status) {
  return request({
    url: `/users/${id}/status`,
    method: 'put',
    params: { status }
  })
}
