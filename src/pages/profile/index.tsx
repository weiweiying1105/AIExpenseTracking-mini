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

  useDidShow(() => {
    loadUserInfo()
  })

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



  const showWechatModal = () => {
    Taro.showModal({
      title: '联系我们',
      content: '请添加微信号：17521699782',
      showCancel: true,
      cancelText: '取消',
      confirmText: '复制',
      success: (res) => {
        if (res.confirm) {
          // 复制微信号到剪贴板
          Taro.setClipboardData({
            data: '17521699782',
            success: () => {
              Taro.showToast({
                title: '复制成功',
                icon: 'success'
              })
            },
            fail: () => {
              Taro.showToast({
                title: '复制失败，请手动输入',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  }

  const handleFeedback = () => {
    showWechatModal()
  }

  // const handleHelpCenter = () => {
  //   Taro.showToast({
  //     title: '帮助中心功能开发中',
  //     icon: 'none'
  //   })
  // }

  // const handleCooperation = () => {
  //   showWechatModal()
  // }
  // 跳转设置用户信息
  const handleUserInfo = () => {
    Taro.navigateTo({
      url: '/pages/setUserInfo/index'
    })
  }
const DEFAULT_AVATOR_URL = 'https://res.cloudinary.com/dc6wdjxld/image/upload/v1765776810/lzf4i1mudiiiytacznih.jpg'
  return (
    <View className='flex-grow'>
    

      {/* 用户信息区域 */}
      <View className='user-profile' onClick={userInfo.isLogin ? handleUserInfo : handleLogin}>
        <View className='avatar-section'>
          <View className='user-avatar' style={`background-image: url(${userInfo.avatarUrl|| DEFAULT_AVATOR_URL})`}></View>
        </View>
        <View className='user-info-text'>
          <Text className='user-name'>{userInfo.nickName || '微信用户'}</Text>
          {/* <Text className='user-handle'>@{userInfo.nickName ? userInfo.nickName.toLowerCase() : 'sophia.c'}</Text> */}
        </View>
      </View>

      {/* 功能菜单 */}
      <View className='navigation-menu'>
        <View className='menu-item' onClick={handleFeedback}>
          {/* <View className='menu-icon-wrapper'>
            <svg fill="currentColor" height="24px" viewBox="0 0 24 24" width="24px" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
            </svg>
          </View> */}
          <Text className='menu-label'>问题反馈/合作</Text>
        </View>

        {/* <View className='menu-item' onClick={handleCooperation}>
          <View className='menu-icon-wrapper'>
            <svg fill="currentColor" height="24px" viewBox="0 0 24 24" width="24px" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </View>
          <Text className='menu-label'>合作</Text>
        </View> */}

        {/* <View className='menu-item' onClick={handleHelpCenter}>
          <View className='menu-icon-wrapper'>
            <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
              <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z"></path>
            </svg>
          </View>
          <Text className='menu-label'>Settings</Text>
        </View> */}
      </View>
    </View>
  )
}

export default Profile