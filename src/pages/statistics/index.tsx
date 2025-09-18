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
        const categoryColor = expense.category && expense.category.color ? expense.category.color : '#999'
        
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
    
    const calendarData: Array<{ day: number; amount: number; isEmpty: boolean }> = []
    
    // 添加空白天数（上个月的尾部）
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarData.push({ day: 0, amount: 0, isEmpty: true })
    }
    
    // 添加当月的天数
    for (let day = 1; day <= daysInMonth; day++) {
      calendarData.push({
        day,
        amount: dailyExpenses[day] || 0,
        isEmpty: false
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
      {/* 月份切换器 */}
      <View className='month-selector'>
        <Button 
          size='small' 
          fill='outline'
          onClick={() => changeMonth(-1)}
        >
          ‹
        </Button>
        
        <Button 
          className='month-button'
          fill='outline'
          onClick={() => setShowDatePicker(true)}
        >
          {formatMonth(currentDate)}
        </Button>
        
        <Button 
          size='small' 
          fill='outline'
          onClick={() => changeMonth(1)}
        >
          ›
        </Button>
      </View>

      {/* 月份 选择器 */}
     <DatePicker
        visible={showDatePicker}
        value={currentDate}
        onClose={() => setShowDatePicker(false)}
        onConfirm={(date) => {
          setCurrentDate(new Date(date[0].value as string))
          setShowDatePicker(false)
        }}
      />

      {/* 概览卡片 平铺一个月的日历，上面展示每天的支出总值*/}
      <View className='calendar-card'>
        <View className='calendar-container'>
          {/* 星期标题 */}
          <View className='calendar-weekdays'>
            {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
              <View key={index} className='weekday'>
                <Text className='weekday-text'>{day}</Text>
              </View>
            ))}
          </View>
          
          {/* 日历网格 */}
          <View className='calendar-grid'>
            {generateCalendarData().map((dayData, index) => (
              <View 
                key={index} 
                className={`calendar-day ${dayData.isEmpty ? 'empty' : ''}`}
              >
                {!dayData.isEmpty && (
                  <>
                    <Text className='day-number'>{dayData.day}</Text>
                    {dayData.amount > 0 && (
                      <Text className='day-amount'>
                        -{formatCurrency(dayData.amount)}
                      </Text>
                    )}
                  </>
                )}
              </View>
            ))}
          </View>
        </View>
      </View>
       {/* 分类统计 */}
       <View className="category-stats">
         <View className="section-title">
           <Text>分类统计</Text>
         </View>
         {monthlyData.categories.length > 0 ? (
           <View className="category-list">
             {monthlyData.categories.map((category, index) => (
               <View key={index} className="category-item">
                 <View className="category-info">
                   <View className="category-name">
                     <View 
                       className="category-color" 
                       style={{ backgroundColor: category.color }}
                     ></View>
                     <Text>{category.name}</Text>
                   </View>
                   <Text className="category-amount">{formatCurrency(category.amount)}</Text>
                 </View>
                 <View className="category-progress">
                   <Progress 
                         percent={category.percentage} 
                         color={category.color}
                         showText={false}
                       />
                   <Text className="percentage-text">{category.percentage.toFixed(1)}%</Text>
                 </View>
               </View>
             ))}
           </View>
         ) : (
           <Empty description="暂无分类数据" />
         )}
       </View>
       
       {/* 支出明细 */}
     
    </View>
  )
}

export default Statistics