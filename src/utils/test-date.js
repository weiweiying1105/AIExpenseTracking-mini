// 测试formatDate函数
import { formatDate } from './date';

// 测试用例1：使用HH:mm格式（24小时制）
const date1 = new Date('2025-12-10T06:29:58.898Z');
const result1 = formatDate(date1, 'HH:mm', true);
console.log('测试1 - HH:mm格式（UTC）:', result1);
// 预期输出: "06:29"

// 测试用例2：使用hh:mm格式（12小时制）
const result2 = formatDate(date1, 'hh:mm', true);
console.log('测试2 - hh:mm格式（UTC）:', result2);
// 预期输出: "06:29"（注意：JavaScript的getHours()返回24小时制，这里我们没有实现12小时制转换）

// 测试用例3：使用yyyy-MM-dd HH:mm:ss格式
const result3 = formatDate(date1, 'yyyy-MM-dd HH:mm:ss', true);
console.log('测试3 - yyyy-MM-dd HH:mm:ss格式（UTC）:', result3);
// 预期输出: "2025-12-10 06:29:58"

// 测试用例4：使用本地时间
const result4 = formatDate(date1, 'HH:mm', false);
console.log('测试4 - HH:mm格式（本地时间）:', result4);
// 预期输出: 根据本地时区转换后的时间
