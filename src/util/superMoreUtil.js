/**
 * Utils function libray
 */
const MENU_CONIFG_KEY = 'plugin_menu_config_'
const MENU_CACHE_KEY = 'plugin_menu_cache_'
const bridgeModule = weex.requireModule('bridgeModule')
const storage = weex.requireModule('storage')
const dom = weex.requireModule('dom')
const navigator = weex.requireModule('navigator')
const superMoreChannel = new BroadcastChannel('superMoreChannel')
const UTIL_VERSION = 'v1.0.1_20210205'
const superMoreUtil = {
  toNum(v) {
    // 版本转成数字
    var a = v.toString()
    var c = a.split('.')
    var num_place = ['', '0', '00', '000', '0000'],
      r = num_place.reverse()
    for (var i = 0; i < c.length; i++) {
      var len = c[i].length
      c[i] = r[len] + c[i]
    }
    var res = c.join('')
    return res
  },
  compareVersion(a) {
    // 判断当前版本是否大于等于比较的版本
    return this.toNum(weex.config.env.appVersion) >= this.toNum(a)
  },
  isSupportSuperMore() {
    // 检查是否支持超级菜单组件
    return this.compareVersion('6.5.0')
  },
  getDeviceInfo() {
    return new Promise((resolve, reject) => {
      bridgeModule.commandInterface(
        JSON.stringify({ operation: 'getDeviceInfo' }),
        resData => {
          try {
            resolve(JSON.parse(resData))
          } catch (error) {}
        },
        error => {
          reject(error)
        }
      )
    })
  },
  open(params = {}, callback) {
    console.log('plugin util version:' + UTIL_VERSION)
    // 打开超级菜单组件
    if (!this.isSupportSuperMore()) {
      // 不支持超级菜单，执行回调
      callback && callback()
      return
    }
    let { pluginData, routerConfigUrl, isColmo, bluetoothEnter } = params
    this.getDeviceInfo().then(resData => {
      let deviceId = resData.result.deviceId
      let storageKey = MENU_CONIFG_KEY + deviceId
      let storageData = JSON.stringify({
        pluginData,
        routerConfigUrl: routerConfigUrl,
        isColmo,
        bluetoothEnter,
      })
      storage.setItem(storageKey, storageData, () => {
        console.log('plugin storageKey: ' + storageKey)
        console.log('plugin storageData: ' + storageData)
        // 菜单路径从调用接口获取，要支持安卓assets和sdcard区分，还有远程调试时页面是http的
        bridgeModule.commandInterface(
          JSON.stringify({
            operation: 'getWeexFunctionPath',
            folder: 'plugin-menu',
          }),
          resData => {
            if (resData) {
              let pluginMenuPath = JSON.parse(resData).path + '/weex.js'
              this.jumpPluginMenu(pluginMenuPath, isColmo)
            }
          },
          error => {
            console.error(JSON.stringify(error))
          }
        )
      })
    })
  },
  jumpPluginMenu(path, isColmo) {
    console.log('plugin pluginMenuPath: ' + path)
    let options = isColmo ? { bgColor: '#000000' } : {}
    options.url = path
    navigator.push(options, event => {})
  },
  reset() {
    // 初始化超级菜单组件，清除一些缓存
    if (!this.isSupportSuperMore()) {
      // 不支持超级菜单，无需处理
      return
    }
    this.getDeviceInfo().then(resData => {
      let deviceId = resData.result.deviceId
      let storageKey = MENU_CACHE_KEY + deviceId
      // 清除菜单使用缓存的标识
      storage.removeItem(storageKey, () => {})
      console.log('plugin 清除缓存: ' + storageKey)
    })
  },
  adjustStyle(el) {
    if (!el) return

    setTimeout(() => {
      dom.getComponentRect(el, option => {
        console.log('adjustStyle: ' + JSON.stringify(option))
        superMoreChannel.postMessage({
          type: 'plugin_menu_custome',
          routerStyle: { height: option.size.height + 'px' },
        })
      })
    }, 100)
  },
  serviceDelegate(param, callback, failCallback) {
    superMoreChannel.onmessage = event => {
      let data = event.data
      if (data.type == 'plugin_menu_service_delegate_result') {
        if (data.isSuccess) {
          callback && callback(data.result)
        } else {
          failCallback && failCallback(data.result)
        }
      }
    }
    superMoreChannel.postMessage({
      type: 'plugin_menu_service_delegate',
      config: param,
    })
  },
  toast(param) {
    this.serviceDelegate(
      { method: 'toast', param: param },
      () => {},
      () => {}
    )
  },
  showLoading(param) {
    this.serviceDelegate(
      { method: 'showLoading', param: param },
      () => {},
      () => {}
    )
  },
  hideLoading(param) {
    this.serviceDelegate(
      { method: 'hideLoading', param: param },
      () => {},
      () => {}
    )
  },
  showConfirmView(param, callback, callbackFail) {
    this.serviceDelegate(
      {
        method: 'commandInterface',
        param: {
          operation: 'showConfirmView',
          ...param,
        },
      },
      callback,
      callbackFail
    )
  },
}

export default superMoreUtil
