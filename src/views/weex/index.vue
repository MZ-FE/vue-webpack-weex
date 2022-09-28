<template>
  <div
    class="app-wrapper"
    @viewappear="viewappear"
    @viewdisappear="viewdisappear"
  >
    <dof-minibar
      :title="title"
      backgroundColor="transparent"
      textColor="#000000"
      :middle-text-style="headerStyle"
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
    </dof-minibar>
    <div class="center margin-top-80">
      <image class="logo" :src="logo"></image>
      <text class="h2">{{ title }}</text>
      <text class="h4">{{ subTitle }}</text>
      <text class="h4"> version:{{ version }} </text>
      <text class="h4"> file:{{ srcFileName }} </text>
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
        text="快速查看"
        type="primary"
        size="big"
        @dofButtonClicked="jumpTo"
      ></dof-button>
      <mz-slider-bar />
    </div>
    <div class="footer">
      <text class="copyright">&copy;Midea IOT software</text>
    </div>
  </div>
</template>
<script>
import leftButton from '../../assets/image/header/back_black@2x.png'
import logo from '../../assets/image/logo.png'
import more from '../../assets/image/header/more_black.png'
import { mapState, mapGetters } from 'vuex'
import { MzSliderBar } from 'mz-weex-ui'
import { event } from '../../common/burialPointData'
import { DofMinibar, DofButton } from 'dolphin-weex-ui'
import pageBase from '../../mixins/pageBase'
import debugUtil from '../../util/debugUtil'
import superMoreUtil from '../../util/superMoreUtil'

export default {
  components: {
    DofMinibar,
    DofButton,
    MzSliderBar,
  },
  mixins: [pageBase],
  data: () => ({
    subTitle: '',
    leftButton,
    more,
    logo,
    version: PLUGIN_VERSION,
    headerStyle: {
      fontFamily: 'PingFangSC-Regular',
      fontWeight: '900',
      fontSize: '28px',
      letterSpacing: 0,
    },
    //超级菜单参数
    superMoreUtil: {
      // pluginData：插件信息
      pluginData: {
        version: PLUGIN_VERSION,
        showCommonQuestion: true,
      },
      routerConfigUrl: weex.config.bundleUrl.split('weex.js')[0] + 'more.js',
      bluetoothEnter: false,
    },
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
    ...mapState(['trackInfo']),
    ...mapGetters(['title']),
  },
  methods: {
    jumpTo() {
      let url = 'welcome.js'
      this.$push(url)
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
    },
    alert() {
      Promise.any([
        new Promise((resolve, reject) => setTimeout(reject, 200, 'Third')),
        new Promise((resolve, reject) => setTimeout(resolve, 500, 'Second')),
        new Promise((resolve, reject) => setTimeout(resolve, 1000, 'First')),
      ])
        .then(value => this.$alert(`Hello: ${value}`))
        .catch(err => console.log(err))
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../css/dolphinweex.scss';
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
</style>
