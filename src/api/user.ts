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
    try {
      const response = await post('/auth/login', loginData)
      return response
    } catch (error: any) {
      throw new Error(error.message || '登录失败')
    }
  }