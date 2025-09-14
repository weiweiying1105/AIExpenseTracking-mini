import { Component } from 'react'

import type { PropsWithChildren } from 'react'

import './app.less'
import { get } from './utils/request'
import Taro from '@tarojs/taro'

class App extends Component<PropsWithChildren> {

  componentDidMount() {
    get('/user/info').then(res => {
      Taro.setStorageSync('userInfo', res.data)
    })
  }

  componentDidShow() { }

  componentDidHide() { }

  // this.props.children 是将要会渲染的页面
  render() {
    return this.props.children
  }
}


export default App
