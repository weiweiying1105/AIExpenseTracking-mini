// 把日期格式化
export const formatDate = (date: Date, fmt: string = 'yyyy-MM-dd HH:mm') => {
    if (!date) {
        return ''
    }
    const map = {
    'yyyy': date.getFullYear(),
    'MM': String(date.getMonth() + 1).padStart(2, '0'),
    'dd': String(date.getDate()).padStart(2, '0'),
    'HH': String(date.getHours()).padStart(2, '0'),
    'mm': String(date.getMinutes()).padStart(2, '0'),
    'ss': String(date.getSeconds()).padStart(2, '0'),
    'S': String(date.getMilliseconds()).padStart(3, '0'),
  };
     return fmt.replace(/yyyy|MM|dd|HH|mm|ss|S/g, (key) => map[key]);

}