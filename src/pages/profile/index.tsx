import { View, Text, Button, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import './index.less'
import { useState, useEffect } from 'react'
import { userApi } from '../../utils/api'
import { getUserInfo } from 'src/api/user'
import { eventBus, EVENT_NAMES } from '../../utils/eventBus'

const Profile = () => {
  const [userInfo, setUserInfo] = useState({
    avatarUrl: '',
    nickName: '点击登录',
    isLogin: false
  })
  useEffect(() => {  const savedUserInfo = Taro.getStorageSync('userInfo')
    if (savedUserInfo) {
      setUserInfo({
        ...savedUserInfo,
        isLogin: true
      })
    }
  })

  const loadUserInfo = () => {
    const savedUserInfo = Taro.getStorageSync('userInfo')
    if (savedUserInfo) {
      setUserInfo({
        ...savedUserInfo,
        isLogin: true
      })
    } else {
      getUserInfo().then(res => {
        setUserInfo(res)
      })
    }
  }

  useEffect(() => {
    loadUserInfo()
  }, [])

  // 监听登录成功事件
  useEffect(() => {
    const handleLoginSuccess = () => {
      // 登录成功后刷新用户信息
      loadUserInfo()
    }

    eventBus.on(EVENT_NAMES.LOGIN_SUCCESS, handleLoginSuccess)

    return () => {
      eventBus.off(EVENT_NAMES.LOGIN_SUCCESS, handleLoginSuccess)
    }
  }, [])

  // 页面显示时刷新数据
  useDidShow(() => {
    loadUserInfo()
  })

  const handleLogin = async () => {
    try {
      // 第一步：获取微信登录code
      const loginRes = await Taro.login()
      console.log('获取到的code:', loginRes.code)
      
      // 第二步：获取用户授权信息
      const profileRes = await Taro.getUserProfile({
        desc: "获取用户信息用于完善资料"
      })
      
      const { userInfo: wxUserInfo } = profileRes
      
      // 第三步：将code和用户信息发送给后端
      const loginData = await userApi.wxLogin({
        code: loginRes.code,
        nickName: wxUserInfo.nickName,
        avatarUrl: wxUserInfo.avatarUrl
      })
      
      // 第四步：保存后端返回的token和用户信息
      if (loginData.token) {
        Taro.setStorageSync('token', loginData.token)
      }
      
      const newUserInfo = {
        avatarUrl: wxUserInfo.avatarUrl,
        nickName: wxUserInfo.nickName,
        isLogin: true,
        userId: loginData.userId
      }
      
      Taro.setStorageSync('userInfo', newUserInfo)
      setUserInfo(newUserInfo)
      
      Taro.showToast({
        title: '登录成功',
        icon: 'success'
      })
      
    } catch (error) {
      console.error('登录失败:', error)
      Taro.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      })
    }
  }



  const handleFeedback = () => {
    Taro.showToast({
      title: '问题反馈功能开发中',
      icon: 'none'
    })
  }

  const handleHelpCenter = () => {
    Taro.showToast({
      title: '帮助中心功能开发中',
      icon: 'none'
    })
  }

  const handleCooperation = () => {
    Taro.showToast({
      title: '我要合作功能开发中',
      icon: 'none'
    })
  }
  // 跳转设置用户信息
  const handleUserInfo = () => {
    Taro.navigateTo({
      url: '/pages/setUserInfo/index'
    })
  }

  return (
    <View className='flex-grow'>
    

      {/* 用户信息区域 */}
      <View className='user-profile' onClick={userInfo.isLogin ? handleUserInfo : handleLogin}>
        <View className='avatar-section'>
          <View className='user-avatar' style={`background-image: url(${userInfo.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzaO5jHM9lA6wqxHloI0fb7uaoEjWRa7CcnVrj-hqgPLWy2S4KVnoE9kQ1uSPClgBMhbwnI1YBHi6vAalop8FQhp6ctG3-yNlSNcy90uzXsf5cXSataaB7huw463S-yT3alASzp1RS8leVqWQ7OGJesScEu-Tw8gJVT_jZFUpECKWWLE1dfI0JymzeKmUda77TBkTFwCZnSkDrliim8lprkTjH6j-IbHof2xOGLAJwjvECnbCSa4X6hgGLSp4ghWa1mhkh7u7JBqY'})`}></View>
        </View>
        <View className='user-info-text'>
          <Text className='user-name'>{userInfo.nickName || 'Sophia'}</Text>
          <Text className='user-handle'>@{userInfo.nickName ? userInfo.nickName.toLowerCase() : 'sophia.c'}</Text>
        </View>
      </View>

      {/* 功能菜单 */}
      <View className='navigation-menu'>
        <View className='menu-item' onClick={handleFeedback}>
          <View className='menu-icon-wrapper'>
            <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
              <path d="M240,120a48.05,48.05,0,0,0-48-48H152.2c-2.91-.17-53.62-3.74-101.91-44.24A16,16,0,0,0,24,40V200a16,16,0,0,0,26.29,12.25c37.77-31.68,77-40.76,93.71-43.3v31.72A16,16,0,0,0,151.12,214l11,7.33A16,16,0,0,0,186.5,212l11.77-44.36A48.07,48.07,0,0,0,240,120ZM40,199.93V40h0c42.81,35.91,86.63,45,104,47.24v65.48C126.65,155,82.84,164.07,40,199.93Zm131,8,0,.11-11-7.33V168h21.6ZM192,152H160V88h32a32,32,0,1,1,0,64Z"></path>
            </svg>
          </View>
          <Text className='menu-label'>Feedback</Text>
        </View>

        <View className='menu-item' onClick={handleCooperation}>
          <View className='menu-icon-wrapper'>
            <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
              <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"></path>
            </svg>
          </View>
          <Text className='menu-label'>Cooperation</Text>
        </View>

        <View className='menu-item' onClick={handleHelpCenter}>
          <View className='menu-icon-wrapper'>
            <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
              <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z"></path>
            </svg>
          </View>
          <Text className='menu-label'>Settings</Text>
        </View>
      </View>
    </View>
  )
}

export default Profile