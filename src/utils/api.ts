import { get, post, put, del } from './request'

// 用户相关接口
export const userApi = {
  // 微信登录
  wxLogin: (data: { code: string; nickName?: string; avatarUrl?: string }) => 
    post('/auth/login', data),
  
  // 获取用户信息
  getUserInfo: () => get('/user/info'),
  
  // 更新用户信息
  updateUserInfo: (data: any) => put('/user/info', data)
}

// 记账相关接口
export const accountingApi = {
  // 获取交易记录
  getTransactions: (params?: any) => get('/transactions', params),
  
  // 添加交易记录
  addTransaction: (data: any) => post('/transactions', data),
  
  // 更新交易记录
  updateTransaction: (id: string, data: any) => put(`/transactions/${id}`, data),
  
  // 删除交易记录
  deleteTransaction: (id: string) => del(`/transactions/${id}`)
}

// 统计相关接口
export const statisticsApi = {
  // 获取统计数据
  getStatistics: (params?: any) => get('/statistics', params),
  
  // 获取分类统计
  getCategoryStats: (params?: any) => get('/statistics/category', params)
}