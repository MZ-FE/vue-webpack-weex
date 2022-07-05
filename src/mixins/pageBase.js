import debugUtil from 'src/util/debugUtil'
import { DofMinibar } from 'dolphin-weex-ui'
import { Bridge } from 'dolphin-native-bridge'
import { mapActions, mapMutations } from 'vuex'
import { getParameterByName } from '../util/util'

const bundleUrl = weex.config.bundleUrl
const srcFileName = bundleUrl.substring(
  bundleUrl.lastIndexOf('/') + 1,
  bundleUrl.lastIndexOf('.js')
)

Vue.config.errorHandler = function (err, vm, info) {
  console.error(err)
}

// 父组件（页面）的基础混入
export default {
  components: {
    DofMinibar,
  },
  data: () => ({
    isIos: weex.config.env.platform === 'iOS',
    srcFileName: srcFileName,
    pluginVersion: PLUGIN_VERSION,
    appearCount: 0,
  }),
  computed: {
    pageHeight() {
      return (750 / weex.config.env.deviceWidth) * weex.config.env.deviceHeight
    },
  },
  async created() {
    await this.init()
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
    ...mapActions([
      'init',
      'updateDeviceInfo',
      'updateDeviceDetail',
      'setBurialPoint',
    ]),
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
    getParameterByName,
    back() {
      //返回上一页
      Bridge.goBack()
    },
    exit() {
      Bridge.backToNative()
    },
    reload() {
      Bridge.reload()
    },
  },
}