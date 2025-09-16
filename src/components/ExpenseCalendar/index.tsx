import { View, Text } from '@tarojs/components'
import { useState, useEffect } from 'react'
import { get } from '../../utils/request'
import './index.less'

interface CalendarDay {
  date: Date
  day: number
  amount: number
  isToday: boolean
  isCurrentMonth: boolean
  hasExpense: boolean
}

interface ExpenseCalendarProps {
  value?: string
  onChange?: (date: string) => void
}

const ExpenseCalendar = ({ value, onChange }: ExpenseCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(value || new Date().toISOString().split('T')[0])
  const [expenseData, setExpenseData] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

  useEffect(() => {
    loadMonthExpenseData()
  }, [currentMonth])

  const loadMonthExpenseData = async () => {
    setLoading(true)
    try {
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth()
      const startDate = new Date(year, month, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]
      
      const res = await get(`/expense/range?startDate=${startDate}&endDate=${endDate}`)
      
      // 处理数据，按日期分组
      const dailyExpenses: Record<string, number> = {}
      res.expenses?.forEach((expense: any) => {
        const date = expense.date.split('T')[0]
        dailyExpenses[date] = (dailyExpenses[date] || 0) + expense.amount
      })
      
      setExpenseData(dailyExpenses)
    } catch (error) {
      console.error('加载月度数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days: CalendarDay[] = []
    const today = new Date()
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      const dateStr = date.toISOString().split('T')[0]
      const amount = expenseData[dateStr] || 0
      
      days.push({
        date,
        day: date.getDate(),
        amount,
        isToday: date.toDateString() === today.toDateString(),
        isCurrentMonth: date.getMonth() === month,
        hasExpense: amount > 0
      })
    }
    
    return days
  }

  const changeMonth = (delta: number) => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + delta)
    setCurrentMonth(newMonth)
  }

  const handleDayClick = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return
    
    const dateStr = day.date.toISOString().split('T')[0]
    setSelectedDate(dateStr)
    onChange?.(dateStr)
  }

  const getAmountColor = (amount: number) => {
    if (amount === 0) return '#f0f0f0'
    if (amount < 50) return '#fff2e8'
    if (amount < 100) return '#ffd8bf'
    if (amount < 200) return '#ffad85'
    if (amount < 500) return '#ff8a50'
    return '#ff6b35'
  }

  const getTextColor = (amount: number) => {
    if (amount === 0) return '#999'
    if (amount < 100) return '#666'
    return '#fff'
  }

  const days = generateCalendarDays()

  return (
    <View className='expense-calendar'>
      {/* 月份切换头部 */}
      <View className='calendar-header'>
        <View className='month-nav' onClick={() => changeMonth(-1)}>
          <Text className='nav-arrow'>‹</Text>
        </View>
        <View className='month-display'>
          <Text className='year'>{currentMonth.getFullYear()}年</Text>
          <Text className='month'>{months[currentMonth.getMonth()]}</Text>
        </View>
        <View className='month-nav' onClick={() => changeMonth(1)}>
          <Text className='nav-arrow'>›</Text>
        </View>
      </View>

      {/* 星期标题 */}
      <View className='weekdays'>
        {weekDays.map(day => (
          <View key={day} className='weekday'>
            <Text>{day}</Text>
          </View>
        ))}
      </View>

      {/* 日历网格 */}
      <View className='calendar-grid'>
        {days.map((day, index) => {
          const isSelected = selectedDate === day.date.toISOString().split('T')[0]
          return (
            <View
              key={index}
              className={`calendar-day ${
                !day.isCurrentMonth ? 'other-month' : ''
              } ${
                day.isToday ? 'today' : ''
              } ${
                isSelected ? 'selected' : ''
              }`}
              style={{
                backgroundColor: day.isCurrentMonth ? getAmountColor(day.amount) : '#fafafa',
                color: day.isCurrentMonth ? getTextColor(day.amount) : '#ccc'
              }}
              onClick={() => handleDayClick(day)}
            >
              <Text className='day-number'>{day.day}</Text>
              {day.hasExpense && day.isCurrentMonth && (
                <Text className='amount-text'>¥{day.amount}</Text>
              )}
              {day.isToday && <View className='today-dot' />}
            </View>
          )
        })}
      </View>

      {/* 图例说明 */}
      <View className='legend'>
        <Text className='legend-title'>支出热力图</Text>
        <View className='legend-items'>
          <View className='legend-item'>
            <View className='legend-color' style={{ backgroundColor: '#f0f0f0' }} />
            <Text className='legend-text'>无支出</Text>
          </View>
          <View className='legend-item'>
            <View className='legend-color' style={{ backgroundColor: '#fff2e8' }} />
            <Text className='legend-text'>{'<'} ¥50</Text>
          </View>
          <View className='legend-item'>
            <View className='legend-color' style={{ backgroundColor: '#ffd8bf' }} />
            <Text className='legend-text'>{'<'} ¥100</Text>
          </View>
          <View className='legend-item'>
            <View className='legend-color' style={{ backgroundColor: '#ffad85' }} />
            <Text className='legend-text'>{'<'} ¥200</Text>
          </View>
          <View className='legend-item'>
            <View className='legend-color' style={{ backgroundColor: '#ff8a50' }} />
            <Text className='legend-text'>{'<'} ¥500</Text>
          </View>
          <View className='legend-item'>
            <View className='legend-color' style={{ backgroundColor: '#ff6b35' }} />
            <Text className='legend-text'>{'≥'} ¥500</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default ExpenseCalendar