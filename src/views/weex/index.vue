<template>
  <div
    class="app-wrapper"
    @viewappear="viewappear"
    @viewdisappear="viewdisappear"
  >
    <dof-minibar
      backgroundColor="transparent"
      @dofMinibarLeftButtonClicked="minibarLeftButtonClick"
      @dofMinibarRightButtonClicked="minibarRightButtonClick"
    >
      <div slot="left">
        <image
          :src="leftButton"
          style="height: 55px; width: 55px; transform: translateX(-10px)"
        ></image>
      </div>
      <div slot="right" class="right-img-wrapper">
        <image :src="more" style="height: 32px; width: 32px"></image>
      </div>
      <div slot="middle" @click="titleClick">
        <text class="text-title">{{ title }}</text>
      </div>
    </dof-minibar>
    <div class="center margin-top-80">
      <image class="logo" :src="logo"></image>
      <text class="h2">{{ title }}</text>
      <text class="h4">{{ subTitle }}</text>
      <text class="h4">file:{{ srcFileName }} version:{{ version }}</text>
      <text class="h4"
        >点击页面标题5下，开启或关闭调试工具，需要再次进入插件</text
      >
      <dof-button
        class="margin-top-80"
        text="打印测试($toast)"
        type="primary"
        size="big"
        @dofButtonClicked="toast"
      ></dof-button>
      <dof-button
        class="margin-top-80"
        text="打印测试($alert)"
        type="primary"
        size="big"
        @dofButtonClicked="alert"
      ></dof-button>
      <dof-button
        class="margin-top-80"
        text="报错并全局捕获打印"
        type="primary"
        size="big"
        @dofButtonClicked="error"
      ></dof-button>
    </div>
    <div class="footer">
      <text class="copyright">&copy;Midea</text>
    </div>

    <debug-window />
  </div>
</template>
<script>
import { mapState, mapGetters } from 'vuex'
import { DofMinibar, DofButton } from 'dolphin-weex-ui'
import leftButton from '../../assets/image/header/back_black@2x.png'
import logo from '../../assets/image/logo.png'
import more from '../../assets/image/header/more_black.png'
import { event } from '../../common/burialPointData'
import pageBase from '../../mixins/pageBase'
import debugUtil from '../../util/debugUtil'
import superMoreUtil from '../../util/superMoreUtil'

export default {
  components: {
    DofMinibar,
    DofButton,
  },
  mixins: [pageBase],
  data: () => ({
    subTitle: '',
    leftButton,
    more,
    logo,
    version: PLUGIN_VERSION,
    // 超级菜单参数
    superMoreUtil: {
      // pluginData：插件信息
      pluginData: {
        version: PLUGIN_VERSION,
        showCommonQuestion: true,
      },
      routerConfigUrl: `${weex.config.bundleUrl.split('weex.js')[0]}more.js`,
      bluetoothEnter: false,
    },
    temp: 0,
  }),
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
  mounted() {
    this.subTitle = 'Midea 模版项目'
  },
  computed: {
    ...mapState(['trackInfo', 'isSitEnv']),
    ...mapGetters(['title']),
  },
  methods: {
    jumpTo() {
      const url = 'welcome.js'
      this.$push(url)
    },
    error() {
      throw new Error('报错测试')
    },
    minibarLeftButtonClick() {
      this.back()
    },
    minibarRightButtonClick() {
      // 埋点
      this.setBurialPoint({
        event: event.plugin_button_click,
        eventParams: {
          element_content: '更多',
        },
      })
      // 打开超级菜单，若不支持则执行调用函数
      superMoreUtil.open(
        {
          deviceId: this.deviceInfo.deviceId,
          ...this.superMoreUtil,
        },
        () => {
          // 插件菜单原逻辑
          this.$toast('版本不支持,请升级您的美居app')
        }
      )
    },
    toast() {
      this.$toast(JSON.stringify(this.trackInfo))
      this.$bridge.hapticFeedback()
      this.$log('toast 触发', '输出了trackInfo', '震动了一下')
    },
    alert() {
      this.$alert('hello world')
      this.$log('alert 触发')
    },

    // 调试模式的开启和关闭方法，可按实际需要自定义
    async titleClick() {
      this.$log({ temp: this.temp++ })
      if (!this.isSitEnv || this.temp < 5) {
        return
      }
      this.temp = 0
      try {
        const result = await this.$storage.getStorage('showDebug')
        const showDebug =
          result === '' || result === undefined ? false : JSON.parse(result)
        this.$log({ step: 4 })

        !showDebug && this.$toast('Debug Mode')
        this.$storage.setStorage('showDebug', !showDebug)
      } catch (_) {
        this.$toast('Debug Mode')
        this.$storage.setStorage('showDebug', true)
      }
    },
  },
}
</script>

<style scoped>
.logo {
  width: 150px;
  height: 150px;
}

.footer {
  position: absolute;
  bottom: 10px;
  right: 20px;
}

.copyright {
  font-size: 20px;
  color: #464c5b;
}

.margin-top-80 {
  margin-top: 80px;
}

.margin-top-40 {
  margin-top: 40px;
}

.margin-bottom-20 {
  margin-bottom: 20px;
}

.text-title {
  font-weight: 900;
  font-size: 32px;
  line-height: 90px;
  color: #000;
}
</style>
