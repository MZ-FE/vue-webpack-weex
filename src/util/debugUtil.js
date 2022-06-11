// ************ debug 相关 *************
const storage = weex.requireModule('storage')
const mm = weex.requireModule('modal')
const debugInfoDataChannel = new BroadcastChannel('debugInfoDataChannel')
const debugUtil = {
  isEnableDebugInfo: false,
  debugInfoKey: 'debugInfo',
  debugInfoDataChannel: debugInfoDataChannel,
  debugInfoExist: '',
  debugInfo: '',
  debugLogSizeLmite: 80000,
  debugLog(...messages) {
    if (!this.isEnableDebugInfo) return

    if (!this.debugInfoExist) {
      this.getDebugLog().then(data => {
        this.debugInfoExist = data || ' ***>>> '
        this.debugLog(...messages)
      })
    } else {
      let debugInfoArray = []
      for (let index = 0; index < messages.length; index++) {
        let message = messages[index]
        if (typeof message == 'object') {
          try {
            message = JSON.stringify(message, null, 2)
          } catch (error) {
            debugInfoArray.push(error)
          }
        } else if (typeof message == 'string') {
          try {
            message = JSON.stringify(JSON.parse(message), null, 2)
          } catch (error) {}
        }
        debugInfoArray = debugInfoArray.concat(this.strCut2Arr(message, 2000))
      }
      let newDebugInfo = new Date() + '\n' + debugInfoArray.join(', ') + '\n\n'
      this.debugInfo += newDebugInfo
      this.setItem(this.debugInfoKey, this.debugInfoExist + this.debugInfo)
    }
  },
  getDebugLog() {
    return new Promise((resolve, reject) => {
      this.getItem(this.debugInfoKey, resp => {
        let result = resp.data || ''
        resolve(result.substr(-this.debugLogSizeLmite))
      })
    })
  },
  resetDebugLog() {
    this.debugInfoExist = ''
    this.debugInfo = ''
  },
  cleanDebugLog() {
    this.debugInfoExist = '***'
    this.debugInfo = ''
    return new Promise((resolve, reject) => {
      this.removeItem(this.debugInfoKey, () => {
        this.debugInfoExist = '***'
        this.debugInfo = ''
        resolve()
      })
    })
  },

  getItem(key, callback) {
    storage.getItem(key, callback)
  },
  setItem(key, value, callback) {
    if (typeof value == 'object') {
      value = JSON.stringify(value)
    }
    value = value.substr(-this.debugLogSizeLmite)
    storage.setItem(key, value, callback)
  },
  removeItem(key, callback) {
    storage.removeItem(key, callback)
  },

  strCut2Arr(str, n) {
    var arr = []
    var len = Math.ceil(str.length / n)
    for (var i = 0; i < len; i++) {
      if (str.length >= n) {
        var strCut = str.substring(0, n)
        arr.push(strCut + '&*&')
        str = str.substring(n)
      } else {
        arr.push(str)
      }
    }
    return arr
  },

  /**
   * 控制台日志输出封装
   * 针对weex平台调试，Android对对象进行字符串转换输出，其他平台按原类型输出
   */
  log(...params) {
    // android平台对参数进行字符串转换，方便在android studio下输出日志查看
    params = params.map(item => {
      return JSON.stringify(item, null, 2)
    })

    console.log(params.join('----'))
  },
}

debugInfoDataChannel.onmessage = event => {
  debugUtil.cleanDebugLog()
}

export default debugUtil
