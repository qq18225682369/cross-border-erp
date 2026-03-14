import request from './request'

export function getPricingByProductId(productId) {
  return request({
    url: `/pricing/product/${productId}`,
    method: 'get'
  })
}

export function savePricing(data) {
  return request({
    url: '/pricing',
    method: 'post',
    data
  })
}

export function batchSavePricing(data) {
  return request({
    url: '/pricing/batch',
    method: 'post',
    data
  })
}

export function deletePricing(id) {
  return request({
    url: `/pricing/${id}`,
    method: 'delete'
  })
}

export function getPricingHistory(productId) {
  return request({
    url: `/pricing/history/${productId}`,
    method: 'get'
  })
}
