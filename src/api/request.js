import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// Gitee Pages 配置 - 使用后端服务器地址
const getBaseURL = () => {
  // 如果是本地开发，使用 localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8080/api'
  }
  // 如果是 Gitee Pages，需要配置后端服务器地址
  // 请替换为您的后端服务器地址
  return 'https://your-backend-server.com/api'
}

// 创建axios实例
const request = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      if (res.code === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('userInfo')
        router.push('/login')
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  error => {
    let message = '网络错误'
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = '未登录或登录已过期'
          localStorage.removeItem('token')
          localStorage.removeItem('username')
          localStorage.removeItem('userInfo')
          router.push('/login')
          break
        case 403:
          message = '没有权限访问'
          break
        case 404:
          message = '请求资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = error.response.data?.message || '请求失败'
      }
    }
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default request
