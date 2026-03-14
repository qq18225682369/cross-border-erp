import request from './request'

/**
 * 获取分类列表
 */
export function getCategoryList() {
  return request({
    url: '/categories',
    method: 'get'
  })
}

/**
 * 添加分类
 */
export function addCategory(data) {
  return request({
    url: '/categories',
    method: 'post',
    data
  })
}

/**
 * 更新分类
 */
export function updateCategory(id, data) {
  return request({
    url: `/categories/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除分类
 */
export function deleteCategory(id) {
  return request({
    url: `/categories/${id}`,
    method: 'delete'
  })
}
