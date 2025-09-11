import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import Taro from '@tarojs/taro'

// 定义响应数据接口
interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 状态码枚举
enum ResponseCode {
  SUCCESS = 200,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  SERVER_ERROR = 500,
  TOKEN_EXPIRED = 1001,
  INVALID_PARAMS = 1002
}

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000/api' 
    : 'https://your-api-domain.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 添加token
    const token = Taro.getStorageSync('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 显示加载提示
    Taro.showLoading({
      title: '加载中...',
      mask: true
    })
    
    return config
  },
  (error) => {
    Taro.hideLoading()
    return Promise.reject(error)
  }
)

// 响应拦截器
// 在响应拦截器中添加token刷新逻辑
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    Taro.hideLoading()
    const { code, message, data } = response.data
    
    switch (code) {
      case ResponseCode.SUCCESS:
        return data
        
      case ResponseCode.TOKEN_EXPIRED:
        // token过期，尝试刷新token
        return handleTokenRefresh(response.config)
        
      case ResponseCode.UNAUTHORIZED:
        // token过期或未授权，清除本地存储并跳转到登录页
        Taro.removeStorageSync('token')
        Taro.removeStorageSync('userInfo')
        Taro.showToast({
          title: message || '登录已过期，请重新登录',
          icon: 'none',
          duration: 2000
        })
        // 跳转到登录页面或显示登录弹窗
        setTimeout(() => {
          Taro.switchTab({
            url: '/pages/profile/index'
          })
        }, 2000)
        return Promise.reject(new Error(message || '登录已过期'))
        
      case ResponseCode.FORBIDDEN:
        Taro.showToast({
          title: message || '没有权限访问',
          icon: 'none'
        })
        return Promise.reject(new Error(message || '没有权限访问'))
        
      case ResponseCode.NOT_FOUND:
        Taro.showToast({
          title: message || '请求的资源不存在',
          icon: 'none'
        })
        return Promise.reject(new Error(message || '请求的资源不存在'))
        
      case ResponseCode.INVALID_PARAMS:
        Taro.showToast({
          title: message || '参数错误',
          icon: 'none'
        })
        return Promise.reject(new Error(message || '参数错误'))
        
      case ResponseCode.SERVER_ERROR:
        Taro.showToast({
          title: message || '服务器错误',
          icon: 'none'
        })
        return Promise.reject(new Error(message || '服务器错误'))
        
      default:
        // 其他错误码
        if (code !== ResponseCode.SUCCESS) {
          Taro.showToast({
            title: message || '请求失败',
            icon: 'none'
          })
          return Promise.reject(new Error(message || '请求失败'))
        }
        return data
    }
  },
  (error) => {
    Taro.hideLoading()
    
    // 如果是401错误，也尝试刷新token
    if (error.response?.status === 401) {
      return handleTokenRefresh(error.config)
    }
    
    return Promise.reject(error)
  }
)

// token刷新处理
const handleTokenRefresh = async (originalRequest: any) => {
  const oldToken = Taro.getStorageSync('token')
  
  if (!oldToken) {
    // 没有token，跳转登录
    redirectToLogin()
    return Promise.reject(new Error('请先登录'))
  }
  
  try {
    // 调用刷新token接口
    const refreshResponse = await axios.post('/auth/refresh', {
      token: oldToken
    })
    
    const newToken = refreshResponse.data.data.token
    Taro.setStorageSync('token', newToken)
    
    // 重新发送原始请求
    originalRequest.headers.Authorization = `Bearer ${newToken}`
    return axios(originalRequest)
    
  } catch (refreshError) {
    // 刷新失败，清除本地数据并跳转登录
    Taro.removeStorageSync('token')
    Taro.removeStorageSync('userInfo')
    redirectToLogin()
    return Promise.reject(refreshError)
  }
}

const redirectToLogin = () => {
  Taro.showToast({
    title: '登录已过期，请重新登录',
    icon: 'none'
  })
  
  setTimeout(() => {
    Taro.switchTab({
      url: '/pages/profile/index'
    })
  }, 1500)
}

// 导出请求方法
export default request

// 导出常用的请求方法
export const get = <T = any>(url: string, params?: any): Promise<T> => {
  return request.get(url, { params })
}

export const post = <T = any>(url: string, data?: any): Promise<T> => {
  return request.post(url, data)
}

export const put = <T = any>(url: string, data?: any): Promise<T> => {
  return request.put(url, data)
}

export const del = <T = any>(url: string): Promise<T> => {
  return request.delete(url)
}

// 导出响应码枚举
export { ResponseCode }