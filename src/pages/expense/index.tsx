import { View, Text, Button, Input, Textarea, Picker } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { get, post } from '../../utils/request'
import { eventBus, EVENT_NAMES } from '../../utils/eventBus'
import './index.less'
import { formatDate } from 'src/utils/date'

const Accounting = () => {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [expenseList, setExpenseList] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [summary, setSummary] = useState<{
    totalAmount: number
  }>()
  
  useEffect(() => {
    getExpenseListByDate(selectedDate)
  }, [selectedDate])

  // 监听登录成功事件
  useEffect(() => {
    const handleLoginSuccess = () => {
      // 登录成功后刷新当前日期的数据
      getExpenseListByDate(selectedDate)
    }

    eventBus.on(EVENT_NAMES.LOGIN_SUCCESS, handleLoginSuccess)

    return () => {
      eventBus.off(EVENT_NAMES.LOGIN_SUCCESS, handleLoginSuccess)
    }
  }, [selectedDate])

  // 页面显示时刷新数据
  useDidShow(() => {
    getExpenseListByDate(selectedDate)
  })
  const getExpenseListByDate = async (date: string) => {
    const start = date
    const end = date
    // 获取指定日期的支出
    get('/expense/range?startDate=' + start + '&endDate=' + end).then(res => {
      // console.log('获取指定日期账单:', res)
      setExpenseList(res.expenses)
      setSummary(res.summary)
    })
  }
  const handleSubmit = async () => {
    if (!description) {
      Taro.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    setLoading(true)
    try {
      // 发送记账数据到接口
      const res =await post('/expense', {
         rawText:description
      })
      console.log('记账接口返回:', res)
      Taro.showToast({
        title: '记账成功',
        icon: 'success'
      })
      getExpenseListByDate(selectedDate)
      // 清空表单
      setAmount('')
      setDescription('')
    } catch (error) {
      console.error('记账失败:', error)
      Taro.showToast({
        title: '记账失败，请重试',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='accounting-container'>
      <View className='header'>
        <Text className='title'>记账</Text>
      </View>
      <View className='date-container'>
        <View className='input-group'>
          <Text className='label inline-block py-[10px]'>记账日期</Text>
          <Picker
            mode='date'
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.detail.value)}
          >
            <View className='picker-display'>
              <Text>{selectedDate}</Text>
            </View>
          </Picker>
        </View>
      </View>
      
      <View className='form-section'>

      

        <View className='input-group box-border'>
          <Text className='label'>描述</Text>
          <Textarea
            className='desc-textarea box-border'
            placeholder='请输入消费描述'
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
            maxlength={200}
            showConfirmBar={false}
            autoHeight
          />
        </View>

        <Button 
          className='submit-btn' 
          onClick={handleSubmit}
          loading={loading}
          disabled={loading}
        >
          {loading ? '记录中...' : '记录'}
        </Button>
      </View>

      <View className='recent-section'>
      <View className="flex justify-between items-center">
        <Text className='section-title'>{selectedDate} 支出</Text>
        <Text className='total-amount text-[#ff4757]'>-￥{summary?.totalAmount || 0}</Text>
      </View>
        {
          expenseList.map((item) => (
            <View className='record-item' key={item.id}>
              <View className='record-info'>
               <View className='flex justify-start items-center'> 
                 <Text className='record-desc'>{item.description}</Text>
                 <Text className='record-category' style={{color: item.category?.color,borderColor: item.category?.color,display: item.category?.name ? 'block' : 'none'}}>{item?.category?.name}</Text>
               </View>
                <Text className='record-time'>{formatDate(new Date(item.date), 'yyyy-MM-dd hh:mm')}</Text>
              </View>
              <Text className='record-amount expense'>-￥{item.amount}</Text>
            </View>
          ))
        }
        
      </View>
    </View>
  )
}

export default Accounting