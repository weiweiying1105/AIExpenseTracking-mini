// 测试formatDate函数的北京时间处理
import { formatDate } from './date';

// 创建一个北京时间的日期对象（例如2023-12-10 15:30:00）
const beijingTime = new Date('2023-12-10T15:30:00+08:00');

console.log('原始日期对象:', beijingTime);
console.log('本地时间字符串:', beijingTime.toLocaleString());
console.log('UTC时间字符串:', beijingTime.toUTCString());

// 测试不同格式和useUTC参数的组合
console.log('\n=== 测试结果 ===');
console.log('yyyy-MM-dd HH:mm (useUTC=false):', formatDate(beijingTime, 'yyyy-MM-dd HH:mm', false));
console.log('yyyy-MM-dd HH:mm (useUTC=true):', formatDate(beijingTime, 'yyyy-MM-dd HH:mm', true));
console.log('yyyy-MM-dd hh:mm (useUTC=false):', formatDate(beijingTime, 'yyyy-MM-dd hh:mm', false));
console.log('yyyy-MM-dd hh:mm (useUTC=true):', formatDate(beijingTime, 'yyyy-MM-dd hh:mm', true));
console.log('yyyy-MM-dd HH:mm:ss (useUTC=false):', formatDate(beijingTime, 'yyyy-MM-dd HH:mm:ss', false));
console.log('yyyy-MM-dd HH:mm:ss (useUTC=true):', formatDate(beijingTime, 'yyyy-MM-dd HH:mm:ss', true));
