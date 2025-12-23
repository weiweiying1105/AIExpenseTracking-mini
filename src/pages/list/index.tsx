import Taro, { usePullDownRefresh, useRouter } from "@tarojs/taro"
import { useEffect, useState } from "react"
import { View, Text } from '@tarojs/components'
import { get } from "src/utils/request";
import { formatDate } from "src/utils/date";
import './index.less'

const List = () => {
  // 获取路由上的参数
  const { month: routeMonth } = useRouter().params as { month?: string };
  const defaultMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const displayMonth = routeMonth ?? defaultMonth;

  const [expenseList, setExpenseList] = useState<any[]>([])
  const [sortType, setSortType] = useState('')

  useEffect(() => {
    getExpenseListByDate(displayMonth)
  },[sortType])
  // 下拉刷新：使用页面的显示月份刷新
  usePullDownRefresh(() => {
    getExpenseListByDate(displayMonth)
      .finally(() => {
        Taro.stopPullDownRefresh()
      })
  })

  useEffect(() => {
    if (displayMonth) {
      getExpenseListByDate(displayMonth)
    }
  }, [displayMonth])

  function getExpenseListByDate(dateStr: string): Promise<void> {
    // 获取指定日期的支出
    return get('/expense/list?month=' + dateStr + '&sort=' + sortType).then(res => {
      console.log('获取指定日期账单:', res);
      let expenses = res || [];
      // 如果传入的是完整日期格式，前端过滤只显示该日的记录
      if (dateStr.length === 10 && dateStr.includes('-')) {
        expenses = expenses.filter((item: any) => {
          // 确保日期格式一致
          const itemDate = new Date(item.date).toISOString().split('T')[0];
          return itemDate === dateStr;
        });
      }
      setExpenseList(expenses);
    }).catch(err => {
      console.error('获取账单失败:', err);
      setExpenseList([]);
    })
  }

  // 格式化页面标题
  const formatPageTitle = (dateStr: string) => {
    if (!dateStr) return '';
    // 检查是否是完整日期格式 (yyyy-MM-dd)
    if (dateStr.length === 10 && dateStr.includes('-')) {
      const date = new Date(dateStr);
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    }
    // 否则是月份格式 (yyyy-MM)
    if (dateStr.length === 7 && dateStr.includes('-')) {
      const [year, month] = dateStr.split('-');
      return `${year}年${month}月`;
    }
    return dateStr;
  };

  const sortedExpenses = [...expenseList].sort((a: any, b: any) =>
    sortType === 'asc' ? Number(a.amount) - Number(b.amount) : Number(b.amount) - Number(a.amount)
  )

  return (
    <View className='list-container'>
      <View className='page-header'>
        <Text className='month-title'>{formatPageTitle(displayMonth)}</Text>
        {/* 加一个排序按钮 */}
        <p className={`sort-button ${sortType === 'desc' ? 'sort-button-active' : ''}`} onClick={() => setSortType(sortType === 'desc' ? '' : 'desc')}>
          最大开销
        </p>
      </View>
      {sortedExpenses.length > 0 ? (
        <View className='records-list'>
          {sortedExpenses.map((item, index) => (
            <View className='record-item fadeInUp' key={item.id} style={{ animationDelay: `${index * 0.1 + 0.3}s` }}>
              {/* <View className='record-icon-wrapper'>
                <View className='record-icon'>💳</View>
              </View> */}
              <View className='record-details'>
                <Text className='record-desc'>{item.description}</Text>
                <Text className='record-date'>{formatDate(new Date(item.date), 'yyyy-MM-dd HH:mm')}</Text>
              </View>
              <Text className='record-amount'>-￥{item?.amount}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View className='empty-list'>
          <Text className='empty-text'>
            {displayMonth.length === 10 ? '当日暂无支出记录' : '本月暂无支出记录'}
          </Text>
        </View>
      )}
    </View>
  )
}
export default List