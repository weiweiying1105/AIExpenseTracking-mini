import { get } from '../utils/request'
import Taro from '@tarojs/taro';

// 获取用户信息
export const getUserInfo = async () => {
    const res = await get('/user/info');
    // console.log(res)
    if (res) {
        Taro.setStorageSync('userInfo', res)
        return res
    }
    throw new Error('获取用户信息失败')
}
