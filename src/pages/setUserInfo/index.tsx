/*
 * @Author: AI Assistant
 * @Date: 2025-09-14 21:53:00
 * @LastEditTime: 2025-09-14 21:53:00
 * @Description: 设置用户信息页面
 * @FilePath: \AIExpenseTracking-mini\src\pages\setUserInfo\index.tsx
 */
import React, { useState, useEffect } from 'react'
import { View, Button, Text, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.less'
import {get, put} from 'src/utils/request'
interface UserInfo {
  nickName?: string
  avatarUrl?: string
}

// Cloudinary配置
const CLOUDINARY_CONFIG = {
  cloud_name: "dc6wdjxld",
  upload_preset: "ai-accounting",
  api_key: "925588468673723",
  api_secret: "gBuAbiJsd-4jaWEDqpCkbwNMogk",
};

const SetUserInfo: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    nickName: '',
    avatarUrl: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 获取已保存的用户信息
    const savedUserInfo = Taro.getStorageSync('userInfo')
    if (savedUserInfo && savedUserInfo.nickName && savedUserInfo.avatarUrl) {
      setUserInfo({
        nickName: savedUserInfo.nickName,
        avatarUrl: savedUserInfo.avatarUrl
      })
    }else{
      get('/user/info').then(res => {
        setUserInfo({
          nickName: res.data.nickName,
          avatarUrl: res.data.avatarUrl
        })
      })
    }
  }, [])

  // 选择头像
  const handleChooseAvatar = (e: any) => {
    const { avatarUrl } = e.detail
    console.log('选择头像:', avatarUrl)
    
    // 先更新临时头像显示
    setUserInfo(prev => ({
      ...prev,
      avatarUrl
    }))
    
    // 上传头像到服务器获取永久地址
    uploadAvatarToServer(avatarUrl).then((permanentAvatarUrl) => {
      console.log('永久头像地址:', permanentAvatarUrl)
      handleSaveUserInfo({avatarUrl: permanentAvatarUrl})
    })
  }
  
  // 上传头像到服务器
  const uploadAvatarToServer = async (tempAvatarUrl: string) => {
    try {
      setLoading(true)
      Taro.showLoading({ title: '上传头像中...' })
      
      const uploadResult = await new Promise<string>((resolve, reject) => {
        Taro.uploadFile({
          url: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/image/upload`,
          filePath: tempAvatarUrl,
          name: "file",
          formData: {
            file: tempAvatarUrl,
            upload_preset: CLOUDINARY_CONFIG.upload_preset,
          },
          success(res) {
            try {
              const data = JSON.parse(res.data);
               console.log("处理返回结果", data);
              if (data.error) {
                reject(new Error(data.error.message));
              } else {
                const url = data.url || data.secure_url;
                resolve(url);
              }
            } catch (error) {
              reject(new Error('解析响应数据失败'));
            }
          },
          fail(error) {
            reject(error);
          }
        });
      });
      
      // 更新头像URL
      setUserInfo(prev => ({
        ...prev,
        avatarUrl: uploadResult
      }));
      Taro.setStorageSync('userInfo', {
        ...userInfo,
        avatarUrl: uploadResult
      })
      Taro.showToast({
        title: '头像上传成功',
        icon: 'success'
      });
      
      Taro.hideLoading()
      return uploadResult;
    } catch (error) {
      console.error('上传头像失败:', error)
      Taro.showToast({
        title: '头像上传失败',
        icon: 'error'
      })
      Taro.hideLoading()
    } finally {
      setLoading(false)
    }
  }
  
  // 输入昵称
  const handleNicknameInput = (e: any) => {
    const nickName = e.detail.value
    console.log('输入昵称:', nickName)
    
    setUserInfo(prev => ({
      ...prev,
      nickName
    }))
  }

  // 保存用户信息
  const handleSaveUserInfo =async ({nickName, avatarUrl}: UserInfo) => {
   

    // 更新本地存储的用户信息
    const savedUserInfo = Taro.getStorageSync('userInfo') || {}
    if (nickName) {
      savedUserInfo.nickName = nickName
    }
    if (avatarUrl) {
      savedUserInfo.avatarUrl = avatarUrl
    }
    const updatedUserInfo = {
      ...savedUserInfo
    }
   const res = await put('/user/info', updatedUserInfo)
  console.log('更新用户信息成功:',res)
    Taro.setStorageSync('userInfo', updatedUserInfo)

    Taro.showToast({
      title: '保存成功',
      icon: 'success'
    })

    // 延迟返回上一页
    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
  }

  // 返回上一页
  const handleGoBack = () => {
    Taro.navigateBack()
  }

  return (
    <View className='set-user-info'>
      <View className='header'>
        <Text className='title'>设置用户信息</Text>
      </View>

      <View className='content'>
        {/* 头像设置 */}
        <View className='avatar-section'>
          <Text className='section-title'>头像</Text>
          <View className='avatar-container'>
            <Button 
              className='avatar-btn p-0'
              openType='chooseAvatar'
              onChooseAvatar={handleChooseAvatar}
              disabled={loading}

            >
              {userInfo.avatarUrl ? (
                <Image 
                  className='avatar-img'
                  src={userInfo.avatarUrl}
                  mode='aspectFill'
                />
              ) : (
                <View className='avatar-placeholder'>
                  <Text className='placeholder-text'>点击选择头像</Text>
                </View>
              )}
            </Button>
          </View>
        </View>

        {/* 昵称设置 */}
        <View className='nickname-section'>
          <Text className='section-title'>昵称</Text>
          <Input
            className='nickname-input'
            type='nickname'
            placeholder='请输入昵称'
            value={userInfo.nickName}
            onInput={handleNicknameInput}
            maxlength={20}
          />
        </View>
      </View>

      {/* 底部按钮 */}
      <View className='footer'>
        <Button 
          className='btn btn-secondary'
          onClick={handleGoBack}
        >
          返回
        </Button>
        <Button 
          className='btn btn-primary'
          onClick={handleSaveUserInfo}
          loading={loading}
        >
          保存
        </Button>
      </View>
    </View>
  )
}

export default SetUserInfo