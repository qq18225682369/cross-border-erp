import request from './request'

/**
 * 获取产品列表（分页）
 */
export function getProductList(params) {
  return request({
    url: '/products',
    method: 'get',
    params
  })
}

/**
 * 获取产品详情
 */
export function getProduct(id) {
  return request({
    url: `/products/${id}`,
    method: 'get'
  })
}

/**
 * 获取产品详情（别名）
 */
export function getProductById(id) {
  return getProduct(id)
}

/**
 * 添加产品
 */
export function addProduct(data) {
  return request({
    url: '/products',
    method: 'post',
    data
  })
}

/**
 * 更新产品
 */
export function updateProduct(id, data) {
  return request({
    url: `/products/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除产品
 */
export function deleteProduct(id) {
  return request({
    url: `/products/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除产品
 */
export function batchDeleteProducts(ids) {
  return request({
    url: '/products/batch',
    method: 'delete',
    data: ids
  })
}

/**
 * 获取仪表盘统计数据
 */
export function getDashboardStats() {
  return request({
    url: '/products/dashboard/stats',
    method: 'get'
  })
}

/**
 * 生成产品编号
 */
export function generateProductCode() {
  return request({
    url: '/products/generate-code',
    method: 'get'
  })
}

export function crawl1688(url) {
  return request({
    url: '/products/crawl-1688',
    method: 'post',
    data: { url }
  })
}

export function recognizeProductImage(image, url) {
  return request({
    url: '/products/recognize-image',
    method: 'post',
    data: { image, url }
  })
}
