import debugUtil from 'src/util/debugUtil'
import { DofMinibar } from 'dolphin-weex-ui'
import { Bridge } from 'dolphin-native-bridge'
import { mapActions, mapMutations, mapState } from 'vuex'
import { getParameterByName } from '../util'
import { event } from '../common/burialPointData'

const { bundleUrl } = weex.config
const srcFileName = bundleUrl.substring(
  bundleUrl.lastIndexOf('/') + 1,
  bundleUrl.lastIndexOf('.js')
)

Vue.config.errorHandler = function (err) {
  console.error(err)
}

// 父组件（页面）的基础混入
export default {
  components: {
    DofMinibar,
  },
  data: () => ({
    isSitEnv: weex.config.env.appEnv === 'sit',
    isIos: weex.config.env.platform === 'iOS',
    srcFileName,
    pluginVersion: PLUGIN_VERSION,
    appearCount: 0,
    disappearLock: false, // 调用一次disappear之后设成true，防止二次调用
  }),
  computed: {
    ...mapState(['deviceInfo']),
    pageHeight() {
      return (750 / weex.config.env.deviceWidth) * weex.config.env.deviceHeight
    },
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
        referPageName,
        curPageName,
      })
      this.$storage.setStorage('pageName', curPageName) // 更新缓存中的当前页面名称

      // 由于安卓端viewappear事件比created早触发，可能会出现初始化信息获取不到的情况，延迟触发埋点
      setTimeout(() => {
        this.setBurialPoint({
          event: event.plugin_page_view,
          eventParams: {
            refer_name: referPageName || '美居首页',
          },
        })
      }, 1000)
    },
    viewdisappear() {
      // 在超级菜单页退出的时候，改方法会被调用两次，需要防止调用两次
      if (!this.disappearLock) {
        this.appearCount--
        this.disappearLock = true
        this.$storage.setStorage('appearCount', this.appearCount)
      }
      debugUtil.log('appearCount', this.appearCount)
    },
    getParameterByName,
    back() {
      // 返回上一页
      this.$pop()
    },
    exit() {
      Bridge.backToNative()
    },
    reload() {
      Bridge.reload()
    },
  },
}
