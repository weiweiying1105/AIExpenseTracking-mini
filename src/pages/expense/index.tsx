import { View, Text, Button, Input, Textarea, Picker } from '@tarojs/components'
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro'
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
  
  // 下啦刷新（通过 hook 绑定事件）
  usePullDownRefresh(() => {
    getExpenseListByDate(selectedDate)
      .finally(() => {
        Taro.stopPullDownRefresh()
      })
  })
  useEffect(() => {
    getExpenseListByDate(selectedDate)
  }, [selectedDate])

  // 监听登录成功和token更新事件，在登录或token可用时刷新数据
  useEffect(() => {
    const handleLoginSuccess = () => {
      getExpenseListByDate(selectedDate)
    }
    
    const handleTokenUpdated = () => {
      getExpenseListByDate(selectedDate)
    }

    eventBus.on(EVENT_NAMES.LOGIN_SUCCESS, handleLoginSuccess)
    eventBus.on(EVENT_NAMES.TOKEN_UPDATED, handleTokenUpdated)
    
    return () => {
      eventBus.off(EVENT_NAMES.LOGIN_SUCCESS, handleLoginSuccess)
      eventBus.off(EVENT_NAMES.TOKEN_UPDATED, handleTokenUpdated)
    }
  }, [selectedDate])

  // 页面显示时刷新数据
  // useDidShow(() => {
  //   getExpenseListByDate(selectedDate)
  // })
  const getExpenseListByDate = async (date: string) => {
    const start = date
    const end = date
    // 获取指定日期的支出
    get('/expense/range?startDate=' + start + '&endDate=' + end).then(res => {
      console.log('获取指定日期账单:', res)
      setExpenseList(res.expenses)
      setSummary(res.summary)
    })
  }
  const handleSubmit = async () => {
    console.log('提交')
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
      {/* 页面头部 */}
   {/*    <View className='page-header'>
        {summary && (
          <View className='header-summary'>
            <Text className='summary-label'>今日总支出</Text>
            <Text className='summary-amount'>￥{summary.totalAmount.toFixed(2)}</Text>
          </View>
        )}
      </View>*/}

      {/* 主要内容区域 */}
      <View className='main-content'>
        {/* 日期选择卡片 */}
        <View className='date-card'>
          {/* <View className='card-header'>
            <Text className='card-title'>选择日期</Text>
          </View> */}
          <Picker
            mode='date'
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.detail.value)}
          >
            <View className='date-picker'>
              <Text className='date-icon'>📅</Text>
              <Text className='date-text'>{selectedDate}</Text>
              <Text className='date-arrow'>›</Text>
            </View>
          </Picker>
        </View>
        
        {/* 表单卡片 */}
        <View className='form-card'>
          <View className='card-header'>
            <Text className='card-title'>添加支出</Text>
          </View>
          <View className='form-content'>
            <View className='input-group'>
              <Textarea
                className='desc-textarea'
                placeholder='填写消费描述。例如：午餐、交通、购物等'
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
              {loading ? '记录中...' : '保存记录'}
            </Button>
          </View>
        </View>

        {/* 交易记录区域 */}
        <View className='records-section'>
          <View className='section-header'>
            <Text className='section-title'>今日交易</Text>
            <Text className='record-count'>总支出{summary?.totalAmount&&summary?.totalAmount>0?'-':''}￥{summary?.totalAmount?.toFixed(2) || '0.00'}</Text>
          </View>
          
          {expenseList.length > 0 ? (
            <View className='records-list'>
              {expenseList.map((item, index) => (
                <View className='record-item fadeInUp' key={item.id} style={{ animationDelay: `${index * 0.1 + 0.3}s` }}>
                  {/* <View className='record-icon-wrapper'>
                    <View className='record-icon'>💳</View>
                  </View> */}
                  <View className='record-details'>
                    <Text className='record-desc'>{item.description}</Text>
                    <Text className='record-date'>{formatDate(new Date(item.date), 'HH:mm')}</Text>
                  </View>
                  <Text className='record-amount'>-￥{item?.amount}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View className='empty-state'>
              <Text className='empty-icon'>📝</Text>
              <Text className='empty-text'>暂无交易记录</Text>
              <Text className='empty-hint'>点击上方添加您的第一条支出</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

export default Accounting