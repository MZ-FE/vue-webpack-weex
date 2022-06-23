import debugUtil from 'src/util/debugUtil'
import { DofMinibar } from 'dolphin-weex-ui'
import { Bridge } from 'dolphin-native-bridge'
import { mapActions, mapMutations } from 'vuex'

const appDataTemplate = {}
const bundleUrl = weex.config.bundleUrl
const match = /.*\/(T0x.*)\//g.exec(bundleUrl)
const plugin_name = match ? match[1] : 'common' //appConfig.plugin_name
const srcFileName = bundleUrl.substring(
  bundleUrl.lastIndexOf('/') + 1,
  bundleUrl.lastIndexOf('.js')
)
const globalEvent = weex.requireModule('globalEvent')
const appDataChannel = new BroadcastChannel(plugin_name + 'appData')
const pushDataChannel = new BroadcastChannel(plugin_name + 'pushData')

Vue.config.errorHandler = function (err, vm, info) {
  console.error(err)
}

export default {
  components: {
    DofMinibar,
  },
  data: () => ({
    isIos: weex.config.env.platform === 'iOS',
    srcFileName: srcFileName,
    pluginVersion: '1.0.0',
    pluginName: plugin_name,
    isMixinCreated: true,
    isNavigating: false,
    appDataKey: plugin_name + 'appData',
    appDataChannel: appDataChannel,
    pushKey: 'receiveMessage',
    pushDataChannel: pushDataChannel,
    appData: appDataTemplate,
    appearCount: 0,
  }),
  computed: {
    pageHeight() {
      return (750 / weex.config.env.deviceWidth) * weex.config.env.deviceHeight
    },
    isImmersion: function () {
      let result = true
      if (weex.config.env.isImmersion === 'false') {
        result = false
      }
      return result
    },
  },
  async created() {
    await this.updateDeviceInfo()
    await this.updateDeviceDetail()
    //监听全局推送通信渠道(weex->weex)
    pushDataChannel.onmessage = event => {
      this.handleNotification(event.data || {})
    }
    //监听全局应用数据通信渠道(weex->weex)
    appDataChannel.onmessage = event => {
      this.appData = event.data || {}
    }
    //页面创建时获取全局应用数据
    this.getAppData().then(data => {
      this.appData = data || {}
    })
    this.$bridge.addEventListener('receiveMessage', data => {
      this.updateDeviceDetail({ delay: 2000 })
      debugUtil.log('receiveMessage', data)
    })
    this.$bridge.addEventListener('receiveMessageFromApp', data => {
      debugUtil.log('receiveMessageFromApp', data)
    })
  },
  methods: {
    ...mapMutations(['setTrackInfo']),
    ...mapActions(['updateDeviceInfo', 'updateDeviceDetail', 'setBurialPoint']),
    async viewappear() {
      // 判断referPage，用于埋点
      const appearCount = await this.$storage
        .getStorage('appearCount')
        .catch(err => debugUtil.log('getStorage-err', err)) // 获取之前的计数值，如果是0说明从美居首页进入
      debugUtil.log('appearCount', appearCount)
      if (!appearCount || srcFileName === 'weex') {
        this.appearCount = 1
      } else {
        this.appearCount = appearCount + 2
      }
      let referPageName = await this.$storage
        .getStorage('pageName')
        .catch(err => debugUtil.log('getStorage-err', err)) // 获取之前的页面名称
      if (parseInt(appearCount) === 0 && srcFileName === 'weex') {
        referPageName = '美居首页'
      }
      const curPageName = PAGE_NAME[srcFileName]
      this.setTrackInfo({
        referPageName: referPageName,
        curPageName: curPageName,
      })
      this.$storage.setStorage('pageName', curPageName) // 更新缓存中的当前页面名称

      // 由于安卓端viewappear事件比created早触发，可能会出现初始化信息获取不到的情况，延迟触发埋点
      setTimeout(() => {
        this.setBurialPoint({
          event: 'plugin_page_view',
          eventParams: {
            refer_name: referPageName || '美居首页',
          },
        })
      }, 1000)
    },
    viewdisappear() {
      this.appearCount--
      this.$storage.setStorage('appearCount', this.appearCount)
      debugUtil.log('appearCount', this.appearCount)
      debugUtil.resetDebugLog()
    },
    getParameterByName: function (name) {
      let url = this.$getConfig().bundleUrl
      name = name.replace(/[\[\]]/g, '\\$&')
      var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url)
      if (!results) return null
      if (!results[2]) return ''
      return decodeURIComponent(results[2].replace(/\+/g, ' '))
    },
    goTo(pageName, options = {}, params) {
      if (!this.isNavigating) {
        this.isNavigating = true
        // 离开时同步全局应用数据
        Bridge.setItem(this.appDataKey, this.appData, () => {
          //跳转页面
          var path = pageName + '.js'
          if (params) {
            path +=
              '?' +
              Object.keys(params)
                .map(
                  k =>
                    encodeURIComponent(k) + '=' + encodeURIComponent(params[k])
                )
                .join('&')
          }
          options.viewTag = pageName
          Bridge.goTo(path, options)
          setTimeout(() => {
            this.isNavigating = false
          }, 500)
        })
      }
    },
    back() {
      // 如果从插件主页返回美居首页，则清除缓存
      if (srcFileName === 'weex') {
        this.$storage.removeStorage('pageName')
      }
      //返回上一页
      Bridge.goBack()
    },
    exit() {
      Bridge.backToNative()
    },
    getAppData() {
      //获取全局应用数据
      return new Promise((resolve, reject) => {
        Bridge.getItem(this.appDataKey, resp => {
          let data
          if (resp.result == 'success') {
            data = resp.data
            if (typeof data == 'string') {
              try {
                data = JSON.parse(data)
              } catch (error) {}
            }
          }
          if (!data) {
            data = this.appData
          }
          resolve(data)
        })
      })
    },
    updateAppData(data) {
      //更新全局应用数据
      this.appData = Object.assign(this.appData, data)
      appDataChannel.postMessage(this.appData)
    },
    resetAppData() {
      //重置全局应用数据
      return new Promise((resolve, reject) => {
        Bridge.removeItem(this.appDataKey, resp => {
          this.appData = JSON.parse(JSON.stringify(appDataTemplate))
          appDataChannel.postMessage(this.appData)
          resolve()
        })
      })
    },
    handleNotification(data) {
      //处理推送消息
      debugUtil.debugLog(srcFileName, this.pushKey, data)
    },
    reload() {
      Bridge.reload()
    },
  },
}
