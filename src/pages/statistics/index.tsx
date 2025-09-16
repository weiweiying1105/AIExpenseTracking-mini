import { View, Text } from '@tarojs/components'
import { useState, useEffect } from 'react'
import { 
  Button, 
  Cell, 
  CellGroup, 
  DatePicker, 
  Card,
  Grid,
  GridItem,
  Tag,
  Calendar,
  Progress,
  Empty
} from '@nutui/nutui-react-taro'
import { get } from '../../utils/request'
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

  const loadMonthlyData = async () => {
    setLoading(true)
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() < 9 ? `0${currentDate.getMonth() + 1}` : `${currentDate.getMonth() + 1}`
      
      const res = await get(`/static?month=${year}-${month}`)
      
      // 处理分类统计
      const categoryMap = new Map<string, { amount: number, color: string }>()
      let totalExpense = 0
      
      res.expenses?.forEach((expense: ExpenseData) => {
        totalExpense += expense.amount
        const categoryName = expense.category?.name || '其他'
        const categoryColor = expense.category?.color || '#999'
        
        if (categoryMap.has(categoryName)) {
          categoryMap.get(categoryName)!.amount += expense.amount
        } else {
          categoryMap.set(categoryName, { amount: expense.amount, color: categoryColor })
        }
      })
      
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
        expenseCount: res.expenses?.length || 0,
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
    monthlyData.expenses.forEach(expense => {
      const expenseDate = new Date(expense.date)
      if (expenseDate.getFullYear() === year && expenseDate.getMonth() === month) {
        const day = expenseDate.getDate()
        dailyExpenses[day] += expense.amount
      }
    })
    
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


  return (
    <View className='statistics-container'>
      {/* 头部 */}
      <View className='header'>
        <Text className='title'>统计分析</Text>
      </View>

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
      <Card className='calendar-card'>
        <View className='card-header'>
          <Text className='card-title'>每日支出</Text>
        </View>
        
        <View className='calendar-container'>
          {/* 星期标题 */}
          <View className='weekdays'>
            {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
              <View key={index} className='weekday'>
                <Text className='weekday-text'>{day}</Text>
              </View>
            ))}
          </View>
          
          {/* 日历网格 */}
          <View className='calendar-grid'>
            {generateCalendarData().map((item, index) => (
              <View key={index} className={`calendar-day ${item.isEmpty ? 'empty' : ''}`}>
                {!item.isEmpty && (
                  <>
                    <Text className='day-number'>{item.day}</Text>
                    <Text className='day-amount'>
                      {item.amount > 0 ? `¥${item.amount.toFixed(0)}` : ''}
                    </Text>
                  </>
                )}
              </View>
            ))}
          </View>
        </View>
      </Card>

      {/* 分类统计 */}
      {monthlyData.categories.length > 0 ? (
        <Card className='category-card'>
          <View className='card-header'>
            <Text className='card-title'>分类统计</Text>
          </View>
          
          <View className='category-list'>
            {monthlyData.categories.map((category, index) => (
              <View key={index} className='category-item'>
                <View className='category-info'>
                  <View className='category-header'>
                    <Tag 
                      color={category.color}
                      plain
                    >
                      {category.name}
                    </Tag>
                    <Text className='category-amount'>
                      {formatCurrency(category.amount)}
                    </Text>
                  </View>
                  
                  <Progress 
                    percent={Math.round(category.percentage)}
                    color={category.color}
                    showText={false}
                    strokeWidth='8px'
                  />
                  
                  <Text className='category-percentage'>
                    {category.percentage.toFixed(1)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
      ) : null}

      {/* 支出明细 */}
      <Card className='detail-card'>
        <View className='card-header'>
          <Text className='card-title'>支出明细</Text>
        </View>
        
        {monthlyData.expenses.length > 0 ? (
          <CellGroup>
            {monthlyData.expenses.slice(0, 10).map((expense) => (
              <Cell
                 key={expense.id}
                 title={expense.description}
                 description={formatDate(expense.date)}
                 extra={
                   <View className='expense-extra'>
                     {expense.category && (
                       <Tag 
                         color={expense.category.color}
                         plain
                       >
                         {expense.category.name}
                       </Tag>
                     )}
                     <Text className='expense-amount'>
                       -{formatCurrency(expense.amount)}
                     </Text>
                   </View>
                 }
               />
            ))}
            
            {monthlyData.expenses.length > 10 && (
              <Cell
                 title={`还有 ${monthlyData.expenses.length - 10} 条记录`}
                 description='点击查看更多'
               />
            )}
          </CellGroup>
        ) : (
          <Empty description='暂无支出记录' />
        )}
      </Card>
    </View>
  )
}

export default Statistics