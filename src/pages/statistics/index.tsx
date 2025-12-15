import { View, Text, Image } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { 
  Button, 
  DatePicker
} from '@nutui/nutui-react-taro'
import { get } from '../../utils/request'
import { eventBus, EVENT_NAMES } from '../../utils/eventBus'
import './index.less'
import arrowIcon from '../../assets/images/arrow.svg'
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

  // 监听token更新事件，在token可用时刷新数据
  useEffect(() => {
    const handleTokenUpdated = () => {
      // token更新后刷新统计数据
      loadMonthlyData()
    }

    eventBus.on(EVENT_NAMES.TOKEN_UPDATED, handleTokenUpdated)

    return () => {
      eventBus.off(EVENT_NAMES.TOKEN_UPDATED, handleTokenUpdated)
    }
  }, [currentDate])



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
        const categoryColor = expense.category && expense.category.color ? expense.category.color : '#667eea'
        
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
    return `-${amount.toFixed(2)}`
  }

  // 根据支出金额获取颜色深浅
  const getExpenseColor = (amount: number) => {
    if (amount === 0) return 'transparent'
    const maxExpense = Math.max(...Object.values(getDailyExpenses()))
    const intensity = Math.min(amount / maxExpense, 1)
    const r = Math.floor(102 + (255 - 102) * (1 - intensity))
    const g = Math.floor(126 + (255 - 126) * (1 - intensity))
    const b = Math.floor(234 + (255 - 234) * (1 - intensity))
    return `rgba(${r}, ${g}, ${b}, ${0.2 + intensity * 0.3})`
  }
  function goList(dateStr: string) {
    Taro.navigateTo({
      url: '/pages/list/index?month=' + dateStr
    })
  }

  return (
    <View className='statistics-container'>
      {/* 页面头部 */}
      <View className='page-header'>
          {/* 月份选择器 */}
        <View className='month-selector'>
          <Button className='nav-btn' onClick={() => changeMonth(-1)}>
            <Text className='nav-icon'>‹</Text>
          </Button>
          <View className='month-display'>
            <Text className='month-text'>{formatMonth(currentDate)}</Text>
          </View>
          <Button className='nav-btn' onClick={() => changeMonth(1)}>
            <Text className='nav-icon'>›</Text>
          </Button>
        </View>
        {/* <Text className='header-title'>Statistics</Text> */}
        <View className='header-summary'>
          <View className='summary-card'>
            <Text className='summary-label'>总支出</Text>
            <Text className='summary-value'>{formatCurrency(monthlyData.totalExpense)}</Text>
          </View>
          <View className='summary-card'>
            <Text className='summary-label'>日均</Text>
            <Text className='summary-value'>{formatCurrency(monthlyData.avgDaily)}</Text>
          </View>
          <View className='summary-card'>
            <Text className='summary-label'>笔数</Text>
            <Text className='summary-value'>{monthlyData.expenseCount}</Text>
          </View>
        </View>
      </View>

      <View className='main-content'>
      

        {/* 日历卡片 */}
        <View className='calendar-card'>
          <View className='card-header'>
            <Text className='card-title'>支出日历</Text>
          </View>
          
          <View className='calendar-grid'>
            {/* 星期标题 */}
            <View className='weekday'>日</View>
            <View className='weekday'>一</View>
            <View className='weekday'>二</View>
            <View className='weekday'>三</View>
            <View className='weekday'>四</View>
            <View className='weekday'>五</View>
            <View className='weekday'>六</View>
            
            {/* 日历日期 */}
            {generateCalendarData().map((dayData, index) => (
              <View 
                key={index} 
                className={`calendar-day ${dayData.isEmpty ? 'empty' : ''} ${dayData.isToday ? 'today' : ''} ${dayData.amount > 0 ? 'has-expense' : ''}`}
                onClick={() => {
                  if (!dayData.isEmpty) {
                    const year = currentDate.getFullYear()
                    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0')
                    const day = dayData.day.toString().padStart(2, '0')
                    const dateStr = `${year}-${month}-${day}`
                    goList(dateStr)
                  }
                }}
              >
                {!dayData.isEmpty && (
                  <>
                    <Text className={`day-number ${dayData.isToday ? 'today-number' : ''}`}>{dayData.day}</Text>
                    {dayData.amount > 0 && (
                      <View className='expense-indicator'>
                        <Text className={`day-amount ${dayData.isToday ? 'today-amount' : ''}`}>{formatCurrency(dayData.amount)}</Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* 分类统计卡片 */}
        {monthlyData.categories.length > 0 ? (
          <View className='categories-card'>
            <View className='card-header' onClick={() => {
              const year = currentDate.getFullYear();
              const month = currentDate.getMonth() < 9 ? `0${currentDate.getMonth() + 1}` : `${currentDate.getMonth() + 1}`;
              goList(`${year}-${month}`);
            }}>
              <Text className='card-title'>{currentDate.getMonth() + 1}月分类统计</Text>
             {monthlyData.categories.length > 0 && (
               <view className='card-label'>明细列表<Image src={arrowIcon} className='arrow-icon' /></view>
             )}
            </View>
            <View className='categories-list'>
              {monthlyData.categories.map((category, index) => (
                <View key={index} className='category-item' animation={`fadeInUp ${index * 0.1 + 0.3}s ease-out`}>
                  <View className='category-header'>
                    <View className='category-info'>
                      {/* <View className='category-dot' style={{ backgroundColor: category.color }}></View> */}
                      <Text className='category-name'>{category.name}</Text>
                    </View>
                    <View className='category-stats'>
                      <Text className='category-amount'>{formatCurrency(category.amount)}</Text>
                      <Text className='category-percentage'>{category.percentage.toFixed(1)}%</Text>
                    </View>
                  </View>
                  <View className='category-progress'>
                    <View 
                      className='progress-fill' 
                      style={{
                        width: `${category.percentage}%`,
                        backgroundColor: category.color
                      }}
                    ></View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View className='empty-state'>
            <Text className='empty-icon'>📊</Text>
            <Text className='empty-text'>暂无统计数据</Text>
            <Text className='empty-hint'>添加一些支出记录来查看统计信息</Text>
          </View>
        )}
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