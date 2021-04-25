export default class SocketService {
  /* 
  单例
  */
  static instance = null
  static get Instance() {
    if (!this.instance) {
      this.instance = new SocketService()
    }
    return this.instance
  }

  //和服务端连接的对象
  ws = null

  // 存储回调函数
  callBackMapping = {}

  // 标识是否连接成功
  connected = false
  // 重新尝试的次数
  sendRetryCount = 0
  // 重新连接的尝试次数
  connectRetryCount = 0
  // 定义连接服务器的方法
  connect() {
    // 连接服务器
    if (!window.WebSocket) {
      return console.log('您的浏览器不支持WebSocket')
    }
    this.ws = new WebSocket('ws://localhost:9998')
    // 连接成功的事件
    this.ws.onopen = () => {
      console.log('连接服务器端成功了')
      this.connected = true
    }
    // 1.连接服务端失败
    // 2.服务器关闭
    this.ws.onclose = () => {
      console.log('连接服务端失败')
      this.connected = false
      this.connectRetryCount++
      setTimeout(() => {
        this.connect()
      }, this.connectRetryCount * 500)
    }
    // 得到服务端发送过来的数据
    this.ws.onmessage = (msg) => {
      console.log('从服务端获取到的数据')
      // 真正服务端发送的数据在 msg.data 中
      // console.log(msg.data)
      const recvData = JSON.parse(msg.data)
      const socketType = recvData.socketType
      if (this.callBackMapping[socketType]) {
        const action = recvData.action
        if (action === 'getData') {
          const realData = JSON.parse(recvData.data)
          this.callBackMapping[socketType].call(this, realData)
        } else if (action === 'fullScreen') {
          this.callBackMapping[socketType].call(this, recvData)
        } else if (action === 'themeChange') {
          this.callBackMapping[socketType].call(this, recvData)
        }
      }
    }
  }
  // 回调函数的注册
  registerCallBack(socketType, callBack) {
    this.callBackMapping[socketType] = callBack
  }
  // 取消某一个回调函数
  unRegisterCallBack(socketType) {
    this.callBackMapping[socketType] = null
  }
  // 发送数据
  send(data) {
    if (this.connected) {
      this.ws.send(JSON.stringify(data))
    } else {
      this.sendRetryCount++
      setTimeout(() => {
        this.send(data)
      }, this.sendRetryCount * 500)
    }

  }
}