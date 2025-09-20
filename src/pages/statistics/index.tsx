import { View, Text } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { 
  Button, 
  Cell, 
  CellGroup, 
  DatePicker,
  Grid,
  GridItem,
  Tag,
  Progress,
  Empty,
  Calendar
} from '@nutui/nutui-react-taro'
import { get } from '../../utils/request'
import { eventBus, EVENT_NAMES } from '../../utils/eventBus'
import './index.less'

interface ExpenseData {
  id: string
  amount: number
  description: string
  category?: {
    name: string
    color: string
  }
  date: string
}

interface CategoryStat {
  name: string
  amount: number
  color: string
  percentage: number
}

interface MonthlySummary {
  totalExpense: number
  totalIncome: number
  expenseCount: number
  avgDaily: number
  categories: CategoryStat[]
  expenses: ExpenseData[]
}

const Statistics = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [monthlyData, setMonthlyData] = useState<MonthlySummary>({
    totalExpense: 0,
    totalIncome: 0,
    expenseCount: 0,
    avgDaily: 0,
    categories: [],
    expenses: []
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadMonthlyData()
  }, [currentDate])

  // 监听登录成功事件
  useEffect(() => {
    const handleLoginSuccess = () => {
      // 登录成功后刷新统计数据
      loadMonthlyData()
    }

    eventBus.on(EVENT_NAMES.LOGIN_SUCCESS, handleLoginSuccess)

    return () => {
      eventBus.off(EVENT_NAMES.LOGIN_SUCCESS, handleLoginSuccess)
    }
  }, [currentDate])

  // 页面显示时刷新数据
  useDidShow(() => {
    loadMonthlyData()
  })

  const loadMonthlyData = async () => {
    setLoading(true)
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() < 9 ? `0${currentDate.getMonth() + 1}` : `${currentDate.getMonth() + 1}`
      
      const res = await get(`/static?month=${year}-${month}`)
      
      // 处理分类统计
      const categoryMap = new Map<string, { amount: number, color: string }>()
      let totalExpense = 0
      if(res && res.expenses){
        res.expenses.forEach((expense: ExpenseData) => {
        totalExpense += expense.amount
        const categoryName = expense.category && expense.category.name ? expense.category.name : '其他'
        const categoryColor = expense.category && expense.category.color ? expense.category.color : '#4CAF50'
        
        if (categoryMap.has(categoryName)) {
          categoryMap.get(categoryName)!.amount += expense.amount
        } else {
          categoryMap.set(categoryName, { amount: expense.amount, color: categoryColor })
        }
      })
    }
      
      const categories: CategoryStat[] = Array.from(categoryMap.entries()).map(([name, data]) => ({
        name,
        amount: data.amount,
        color: data.color,
        percentage: totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0
      })).sort((a, b) => b.amount - a.amount)
      
      const daysInMonth = new Date(year, parseInt(month) + 1, 0).getDate()
      
      setMonthlyData({
        totalExpense,
        totalIncome: 0, // 暂时设为0，可以后续添加收入功能
        expenseCount: res.expenses ? res.expenses.length : 0,
        avgDaily: totalExpense / daysInMonth,
        categories,
        expenses: res.expenses || []
      })
    } catch (error) {
      console.error('加载月度数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatMonth = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`
  }

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + delta)
    setCurrentDate(newDate)
  }

  // 计算每天的支出
  const getDailyExpenses = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const dailyExpenses: { [key: number]: number } = {}
    
    // 初始化每天为0
    for (let day = 1; day <= daysInMonth; day++) {
      dailyExpenses[day] = 0
    }
    
    // 计算每天的支出总额
    if (monthlyData && monthlyData.expenses) {
      monthlyData.expenses.forEach(expense => {
      const expenseDate = new Date(expense.date)
      if (expenseDate.getFullYear() === year && expenseDate.getMonth() === month) {
        const day = expenseDate.getDate()
        dailyExpenses[day] += expense.amount
      }
    })
    }
    
    return dailyExpenses
  }

  // 获取月份的第一天是星期几
  const getFirstDayOfWeek = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    return new Date(year, month, 1).getDay()
  }

  // 生成日历数据
  const generateCalendarData = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfWeek = getFirstDayOfWeek()
    const dailyExpenses = getDailyExpenses()
    const today = new Date()
    
    const calendarData: Array<{ day: number; amount: number; isEmpty: boolean; isToday: boolean }> = []
    
    // 添加空白天数（上个月的尾部）
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarData.push({ day: 0, amount: 0, isEmpty: true, isToday: false })
    }
    
    // 添加当月的天数
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
      calendarData.push({
        day,
        amount: dailyExpenses[day] || 0,
        isEmpty: false,
        isToday
      })
    }
    
    return calendarData
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  const formatCurrency = (amount: number) => {
    return `¥${amount.toFixed(2)}`
  }
  const marginStyle = { margin: '8px' }

  return (
    <View className='statistics-container'>

      <View className='main-content'>
        {/* 月份/年份切换 */}
        <View className='period-selector'>
          <View className='period-tabs'>
            <View className='tab active'>
              <Text className='tab-text active'>Month</Text>
            </View>
            <View className='tab'>
              <Text className='tab-text'>Year</Text>
            </View>
          </View>
        </View>

        {/* 日历卡片 */}
        <View className='calendar-card'>
          <View className='calendar-header'>
            <Button className='nav-btn' onClick={() => changeMonth(-1)}>
              <Text className='nav-icon'>‹</Text>
            </Button>
            <Text className='month-title'>{formatMonth(currentDate)}</Text>
            <Button className='nav-btn' onClick={() => changeMonth(1)}>
              <Text className='nav-icon'>›</Text>
            </Button>
          </View>
          
          <View className='calendar-grid'>
            {/* 星期标题 */}
            <View className='weekday'>S</View>
            <View className='weekday'>M</View>
            <View className='weekday'>T</View>
            <View className='weekday'>W</View>
            <View className='weekday'>T</View>
            <View className='weekday'>F</View>
            <View className='weekday'>S</View>
            
            {/* 日历日期 */}
            {generateCalendarData().map((dayData, index) => (
              <View key={index} className={`calendar-day ${dayData.isEmpty ? 'empty' : ''} ${dayData.isToday ? 'today' : ''}`}>
                {!dayData.isEmpty && (
                  <>
                    <Text className='day-number'>{dayData.day}</Text>
                    {dayData.amount > 0 && (
                      <Text className='day-amount'>{formatCurrency(dayData.amount)}</Text>
                    )}
                  </>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* 统计卡片 */}
        <View className='stats-card'>
          {monthlyData.categories.map((category, index) => (
            <View key={index} className='stat-item'>
              <View className='stat-header'>
                <Text className='stat-label'>{category.name}</Text>
                <Text className='stat-value'>${category.amount.toFixed(2)}</Text>
              </View>
              <View className='progress-bar'>
                <View 
                  className='progress-fill' 
                  style={{
                    width: `${category.percentage}%`,
                    backgroundColor: category.color
                  }}
                ></View>
              </View>
              {/* <Text className='stat-percentage'>{category.percentage.toFixed(1)}%</Text> */}
            </View>
          ))}
        </View>
      </View>

   

      {/* 月份选择器 */}
      <DatePicker
        visible={showDatePicker}
        value={currentDate}
        onClose={() => setShowDatePicker(false)}
        onConfirm={(date) => {
          setCurrentDate(new Date(date[0].value as string))
          setShowDatePicker(false)
        }}
      />
    </View>
  )
}

export default Statistics