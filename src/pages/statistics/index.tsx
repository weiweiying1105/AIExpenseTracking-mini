import { View, Text } from '@tarojs/components'
import { useState, useEffect } from 'react'
import './index.less'

const Statistics = () => {
  const [monthlyData, setMonthlyData] = useState({
    income: 0,
    expense: 0,
    balance: 0
  })

  useEffect(() => {
    // 获取统计数据
    loadStatistics()
  }, [])

  const loadStatistics = () => {
    // 模拟数据加载
    setMonthlyData({
      income: 5000,
      expense: 3200,
      balance: 1800
    })
  }

  return (
    <View className='statistics-container'>
      <View className='header'>
        <Text className='title'>统计</Text>
      </View>
      
      <View className='summary-card'>
        <View className='summary-item'>
          <Text className='label'>本月收入</Text>
          <Text className='amount income'>+{monthlyData.income}</Text>
        </View>
        <View className='summary-item'>
          <Text className='label'>本月支出</Text>
          <Text className='amount expense'>-{monthlyData.expense}</Text>
        </View>
        <View className='summary-item'>
          <Text className='label'>结余</Text>
          <Text className='amount balance'>{monthlyData.balance}</Text>
        </View>
      </View>

      <View className='chart-section'>
        <Text className='section-title'>支出分析</Text>
        {/* 这里可以添加图表组件 */}
      </View>
    </View>
  )
}

export default Statistics