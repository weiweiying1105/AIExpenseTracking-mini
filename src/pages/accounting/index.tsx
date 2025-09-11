import { View, Text, Button, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './index.less'

const Accounting = () => {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('支出')

  const handleSubmit = () => {
    if (!amount || !description) {
      Taro.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }
    // 这里可以添加保存记账记录的逻辑
    Taro.showToast({
      title: '记账成功',
      icon: 'success'
    })
    // 清空表单
    setAmount('')
    setDescription('')
  }

  return (
    <View className='accounting-container'>
      <View className='header'>
        <Text className='title'>记账</Text>
      </View>
      
      <View className='form-section'>
        <View className='category-tabs'>
          <View 
            className={`tab ${category === '支出' ? 'active' : ''}`}
            onClick={() => setCategory('支出')}
          >
            <Text>支出</Text>
          </View>
          <View 
            className={`tab ${category === '收入' ? 'active' : ''}`}
            onClick={() => setCategory('收入')}
          >
            <Text>收入</Text>
          </View>
        </View>

        <View className='input-group'>
          <Text className='label'>金额</Text>
          <Input
            className='amount-input'
            type='digit'
            placeholder='请输入金额'
            value={amount}
            onInput={(e) => setAmount(e.detail.value)}
          />
        </View>

        <View className='input-group'>
          <Text className='label'>描述</Text>
          <Input
            className='desc-input'
            placeholder='请输入消费描述'
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
          />
        </View>

        <Button className='submit-btn' onClick={handleSubmit}>
          记录
        </Button>
      </View>

      <View className='recent-section'>
        <Text className='section-title'>最近记录</Text>
        <View className='record-item'>
          <View className='record-info'>
            <Text className='record-desc'>午餐</Text>
            <Text className='record-time'>今天 12:30</Text>
          </View>
          <Text className='record-amount expense'>-¥25.00</Text>
        </View>
        <View className='record-item'>
          <View className='record-info'>
            <Text className='record-desc'>工资</Text>
            <Text className='record-time'>昨天 09:00</Text>
          </View>
          <Text className='record-amount income'>+¥5000.00</Text>
        </View>
      </View>
    </View>
  )
}

export default Accounting