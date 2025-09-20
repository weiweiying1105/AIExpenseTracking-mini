import Taro from '@tarojs/taro'

// 定义响应数据接口
interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 定义请求配置接口
interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  timeout?: number
}

// 状态码枚举
enum ResponseCode {
  SUCCESS = 200,
  UNAUTHORIZED = 401,// 未授权
  FORBIDDEN = 403, // 禁止访问
  NOT_FOUND = 404, // 资源不存在
  SERVER_ERROR = 500, // 服务器错误
  TOKEN_EXPIRED = 1001, // token过期
  INVALID_PARAMS = 1002 // 参数无效
}

// 基础配置
const BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000/api'
  : 'https://your-api-domain.com/api'

const DEFAULT_TIMEOUT = 300000

// 封装的请求函数
const request = async <T = any>(config: RequestConfig): Promise<T> => {
  // 动态获取最新的token
  const token = Taro.getStorageSync('token') || ''

  const header: Record<string, string> = {
    'Content-Type': 'application/json',
    ...config.header
  }

  if (token) {
    header.Authorization = `Bearer ${token}`
  }

  // 显示加载提示
  Taro.showLoading({
    title: '加载中...',
    mask: true
  })

  try {
    const response = await Taro.request({
      url: `${BASE_URL}${config.url}`,
      method: config.method || 'GET',
      data: config.data,
      header,
      timeout: config.timeout || DEFAULT_TIMEOUT
    })

    Taro.hideLoading()

    const { statusCode, data } = response

    // 处理HTTP状态码
    if (statusCode === 401) {
      return handleTokenRefresh(config)
    }

    if (statusCode !== 200) {
      throw new Error(`HTTP ${statusCode}: 请求失败`)
    }

    // 处理业务状态码
    const apiResponse = data as ApiResponse
    const { code, message, data: responseData } = apiResponse

    switch (code) {
      case ResponseCode.SUCCESS:
        return responseData

      case ResponseCode.TOKEN_EXPIRED:
        return handleTokenRefresh(config)

      case ResponseCode.UNAUTHORIZED:
        // token过期或未授权，清除本地存储并跳转到登录页
        Taro.removeStorageSync('token')
        Taro.removeStorageSync('userInfo')
        Taro.showToast({
          title: message || '登录已过期，请重新登录',
          icon: 'none',
          duration: 2000
        })
        setTimeout(() => {
          Taro.switchTab({
            url: '/pages/profile/index'
          })
        }, 2000)
        throw new Error(message || '登录已过期')

      case ResponseCode.FORBIDDEN:
        Taro.showToast({
          title: message || '没有权限访问',
          icon: 'none'
        })
        throw new Error(message || '没有权限访问')

      case ResponseCode.NOT_FOUND:
        Taro.showToast({
          title: message || '请求的资源不存在',
          icon: 'none'
        })
        throw new Error(message || '请求的资源不存在')

      case ResponseCode.INVALID_PARAMS:
        Taro.showToast({
          title: message || '参数错误',
          icon: 'none'
        })
        throw new Error(message || '参数错误')

      case ResponseCode.SERVER_ERROR:
        Taro.showToast({
          title: message || '服务器错误',
          icon: 'none'
        })
        throw new Error(message || '服务器错误')

      default:
        if (code !== ResponseCode.SUCCESS) {
          Taro.showToast({
            title: message || '请求失败',
            icon: 'none'
          })
          throw new Error(message || '请求失败')
        }
        return responseData
    }
  } catch (error: any) {
    Taro.hideLoading()

    // 网络错误处理
    if (error.errMsg) {
      Taro.showToast({
        title: '网络请求失败',
        icon: 'none'
      })
    }

    throw error
  }
}

// token刷新处理
const handleTokenRefresh = async <T = any>(originalRequest: RequestConfig): Promise<T> => {
  const oldToken = Taro.getStorageSync('token')

  if (!oldToken) {
    // 没有token，跳转登录
    redirectToLogin()
    throw new Error('请先登录')
  }

  try {
    // 调用刷新token接口
    const refreshResponse = await Taro.request({
      url: `${BASE_URL}/auth/refresh`,
      method: 'POST',
      data: { token: oldToken },
      header: { 'Content-Type': 'application/json' }
    })

    if (refreshResponse.statusCode === 200) {
      const newToken = refreshResponse.data.data.token
      Taro.setStorageSync('token', newToken)

      // 重新发送原始请求
      const newConfig = {
        ...originalRequest,
        header: {
          ...originalRequest.header,
          Authorization: `Bearer ${newToken}`
        }
      }
      return request(newConfig)
    } else {
      throw new Error('刷新token失败')
    }
  } catch (refreshError) {
    // 刷新失败，清除本地数据并跳转登录
    Taro.removeStorageSync('token')
    Taro.removeStorageSync('userInfo')
    redirectToLogin()
    throw refreshError
  }
}

const redirectToLogin = () => {
  Taro.showToast({
    title: '登录已过期，请重新登录',
    icon: 'none'
  })

  setTimeout(() => {
    Taro.navigateTo({
      url: '/pages/login/index'
    })
  }, 1500)
}

// 导出请求方法
export default request

// 导出常用的请求方法
export const get = <T = any>(url: string, params?: any): Promise<T> => {
  const config: RequestConfig = {
    url: params ? `${url}?${new URLSearchParams(params).toString()}` : url,
    method: 'GET'
  }
  return request<T>(config)
}

export const post = <T = any>(url: string, data?: any): Promise<T> => {
  const config: RequestConfig = {
    url,
    method: 'POST',
    data
  }
  return request<T>(config)
}

export const put = <T = any>(url: string, data?: any): Promise<T> => {
  const config: RequestConfig = {
    url,
    method: 'PUT',
    data
  }
  return request<T>(config)
}

export const del = <T = any>(url: string): Promise<T> => {
  const config: RequestConfig = {
    url,
    method: 'DELETE'
  }
  return request<T>(config)
}

// 导出响应码枚举
export { ResponseCode }