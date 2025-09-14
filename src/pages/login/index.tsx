/*
 * @Author: your name
 * @Date: 2025-09-11 10:19:59
 * @LastEditTime: 2025-09-11 11:49:10
 * @LastEditors: 韦玮莹
 * @Description: 登录页面
 * @FilePath: \AIExpenseTracking-mini\src\pages\login\index.tsx
 */
import React, { useState, useEffect } from 'react'
import { View, Button, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.less'

interface UserInfo {
  nickName: string
  avatarUrl: string
}

interface LoginResponse {
  token: string
  openid: string
  userInfo?: any
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 检查是否已经登录
    checkLoginStatus()
  }, [])

  // 检查登录状态
  const checkLoginStatus = () => {
    const token = Taro.getStorageSync('token')
    const savedUserInfo = Taro.getStorageSync('userInfo')

    if (token && savedUserInfo) {
      // 已登录，跳转到首页
      Taro.switchTab({
        url: '/pages/index/index'
      })
    }
  }

  // 调用登录API
  const callLoginApi = async (loginData: { code: string; nickName?: string; avatarUrl?: string }): Promise<LoginResponse> => {
    return new Promise((resolve, reject) => {
      Taro.request({
        url: `${API_BASE_URL}/auth/login`,
        method: 'POST',
        data: loginData,
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            resolve(res.data.data)
          } else {
            reject(new Error(res.data.message || '登录失败'))
          }
        },
        fail: (err) => {
          console.error('网络请求失败:', err)
          reject(new Error('网络请求失败，请检查网络连接'))
        }
      })
    })
  }

  // 微信登录（不获取用户信息）
  const handleWxLogin = async () => {
    if (loading) return

    setLoading(true)

    try {
      // 1. 获取微信授权code
      const loginRes = await Taro.login()

      if (!loginRes.code) {
        throw new Error('获取微信授权码失败')
      }

      // 2. 调用后端登录接口，用code换取openid和token
      const loginData = {
        code: loginRes.code,
        nickName: '微信用户', // 使用默认昵称
        avatarUrl: '' // 使用默认头像
      }

      const response = await callLoginApi(loginData)

      // 3. 保存登录信息
      if (response.token) {
        Taro.setStorageSync('token', response.token)
        Taro.setStorageSync('userInfo', {
          openid: response.openid,
          nickName: loginData.nickName,
          avatarUrl: loginData.avatarUrl,
          ...response.userInfo
        })

        Taro.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500
        })

        // 4. 跳转到首页
        setTimeout(() => {
          Taro.navigateBack({
            delta: 1
          })
        }, 1500)
      } else {
        throw new Error('登录失败，未获取到token')
      }

    } catch (error: any) {
      console.error('登录失败:', error)
      Taro.showToast({
        title: error.message || '登录失败，请重试',
        icon: 'none',
        duration: 2000
      })
    } finally {
      setLoading(false)
    }
  }



  return (
    <View className='login-container'>
      <View className='login-header'>
        <View className='logo'>
          💰
        </View>
        <Text className='app-name'>AI记账助手11</Text>
        <Text className='app-desc'>智能记账，轻松理财</Text>
      </View>

      <View className='login-content'>
        <View className='login-buttons'>
          <Button
            className='wx-login-btn'
            onClick={handleWxLogin}
            loading={loading}
            disabled={loading}
          >
            {loading ? '登录中...' : '微信快速登录'}
          </Button>



        </View>

        <View className='login-tips'>
          <Text className='tip-text'>
            登录即表示同意《用户协议》和《隐私政策》
          </Text>
        </View>
      </View>
    </View>
  )
}

export default Login