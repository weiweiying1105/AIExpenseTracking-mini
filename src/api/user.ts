import { get, post } from '../utils/request'
import Taro from '@tarojs/taro';

interface LoginResponse {
  token: string
  openid: string
  userInfo?: any
}
// 获取用户信息
export const getUserInfo = async () => {
    const token = Taro.getStorageSync('token')
    if (!token) {
        // 没有token，不发起请求
        throw new Error('请先登录')
    }
    const res = await get('/user/info');
    // console.log(res)
    if (res) {
        Taro.setStorageSync('userInfo', res)
        return res
    }
    throw new Error('获取用户信息失败')
}

// 调用登录API
export const callLoginApi = async (loginData: { code: string; nickName?: string; avatarUrl?: string }): Promise<LoginResponse> => {
  // 直接使用Taro.request而不是封装的post方法，避免循环调用
  try {
    const response = await Taro.request({
      url: `${process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : 'https://www.wwycoding.com/api'}/auth/login`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: loginData
    })
    
    if (response.statusCode === 200) {
      return response.data.data
    } else {
      throw new Error(`登录失败: ${response.data?.message || '未知错误'}`)
    }
  } catch (error: any) {
    console.error('登录API调用失败:', error)
    throw new Error(error.message || '登录失败')
  }
}