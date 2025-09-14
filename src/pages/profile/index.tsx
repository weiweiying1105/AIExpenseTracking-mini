import { View, Text, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.less'
import { useState, useEffect } from 'react'
import { userApi } from '../../utils/api'
import { getUserInfo } from 'src/api/user'

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

  useEffect(() => {
    // 检查是否已经登录
    const savedUserInfo = Taro.getStorageSync('userInfo')
    if (savedUserInfo) {
      setUserInfo({
        ...savedUserInfo,
        isLogin: true
      })
    }else{
      getUserInfo().then(res=>{
         setUserInfo(res)
      })
    
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
    <View className='profile-container'>
      {/* 顶部用户信息区域 */}
      <View className='user-section'>
        <View className='user-info' onClick={userInfo.isLogin ? handleUserInfo : handleLogin}>
          <View className='avatar-container'>
            <View className='avatar'>
              <Image className='avatar-image' src={userInfo.avatarUrl} />
            </View>
            {/* <View className='vip-badge'>VIP</View> */}
          </View>
          <View className='user-details'>
            <Text className='username'>{userInfo.nickName ? userInfo.nickName : '点击登录'}</Text>
            {/* <Text className='user-subtitle'>普通用户 • 2天前</Text> */}
          </View>
        </View>

        {/* 积分统计区域 */}
        {/* <View className='stats-section'>
          <View className='stat-item'>
            <Text className='stat-number'>348</Text>
            <Text className='stat-label'>积分</Text>
          </View>
          <View className='stat-divider'></View>
          <View className='stat-item'>
            <Text className='stat-number'>294</Text>
            <Text className='stat-label'>保单号</Text>
          </View>
        </View> */}
      </View>

      {/* 功能菜单列表 */}
      <View className='menu-section'>



        <View className='menu-item' onClick={handleFeedback}>
          <View className='menu-icon feedback-icon'></View>
          <Text className='menu-text'>问题反馈</Text>
          <View className='menu-arrow'></View>
        </View>

        <View className='menu-item' onClick={handleHelpCenter}>
          <View className='menu-icon help-icon'></View>
          <Text className='menu-text'>帮助中心</Text>
          <View className='menu-arrow'></View>
        </View>

        <View className='menu-item' onClick={handleCooperation}>
          <View className='menu-icon cooperation-icon'></View>
          <Text className='menu-text'>我要合作</Text>
          <View className='menu-arrow'></View>
        </View>
      </View>
    </View>
  )
}

export default Profile