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
import { eventBus, EVENT_NAMES } from '../../utils/eventBus'
import './index.less'
import { callLoginApi } from '../../api/user'


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
        url: '/pages/expense/index'
      })
    }
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
      }

      const response = await callLoginApi(loginData)

      // 3. 保存登录信息
      if (response.token) {
        Taro.setStorageSync('token', response.token)
        Taro.setStorageSync('userInfo', {
          openid: response.openid,
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
          // 5. 延迟发送登录成功事件，确保页面跳转完成后再刷新数据
          setTimeout(() => {
            eventBus.emit(EVENT_NAMES.LOGIN_SUCCESS)
          }, 500)
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
    <View className='login-page-container'>
      <View className='main-content'>
        <Text className='main-title'>聊天记账</Text>
        <Text className='description'>
          简单可爱的记账方式，让理财更轻松
        </Text>
        
        <View className='button-container'>
          <Button
            className='authorize-btn'
            onClick={handleWxLogin}
            loading={loading}
            disabled={loading}
          >
            <View className='btn-content'>
              <Text className='btn-text'>{loading ? '授权中...' : '微信一键登录'}</Text>
            </View>
          </Button>
        </View>
      </View>
      
      <View className='footer'>
        <Text className='footer-text'>
          登录即表示同意
          <Text className='agreement-link' onClick={() => Taro.navigateTo({ url: '/pages/privacy-policy/index' })}>《隐私政策》</Text>
          和
          <Text className='agreement-link' onClick={() => Taro.navigateTo({ url: '/pages/user-agreement/index' })}>《用户协议》</Text>
        </Text>
      </View>
    </View>
  )
}

export default Login