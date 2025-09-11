import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import Taro from '@tarojs/taro'

// 定义响应数据接口
interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}


// 状态码枚举
enum ResponseCode {
  SUCCESS = 200,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  SERVER_ERROR = 500,
  TOKEN_EXPIRED = 1001,
  INVALID_PARAMS = 1002
}


// 创建axios实例
const request:Axio = 