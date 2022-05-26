<template>
  <div class="app-wrapper">
    <dof-minibar
      title="插件"
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
        <image :src="rightButton" style="height: 32px; width: 32px"></image>
      </div>
    </dof-minibar>
    <div class="center margin-top-80">
      <image class="logo" :src="logo"></image>
      <text class="h2">{{ title }}</text>
      <text class="h4 margin-top-40 margin-bottom-20">{{ subTitle }}</text>
      <text class="h4 margin-top-40 margin-bottom-20">
        version:{{ version }}
      </text>
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
    </div>
    <div class="footer">
      <text class="copyright">&copy;Midea IOT software</text>
    </div>
  </div>
</template>
<script>
import leftButton from 'assets/image/header/back_black@2x.png'
import rightButton from 'assets/image/header/refresh.png'
import logo from 'assets/image/logo.png'
import { DofMinibar, DofButton } from 'dolphin-weex-ui'
import { mapState } from 'vuex'

export default {
  components: {
    DofMinibar,
    DofButton,
  },
  data: () => ({
    // title: 'Dolphin Weex',
    subTitle: '',
    leftButton,
    rightButton,
    logo,
    version: PLUGIN_VERSION,
    // version: process.env.PLUGIN_VERSION,
    headerStyle: {
      fontFamily: 'PingFangSC-Regular',
      fontWeight: '900',
      fontSize: '28px',
      letterSpacing: 0,
    },
  }),
  mounted() {
    this.subTitle = 'Midea 模版项目'
  },
  computed: {
    ...mapState(['title']),
  },
  methods: {
    jumpTo() {
      let url = 'welcome.js'
      this.$push(url)
    },
    minibarLeftButtonClick() {},
    minibarRightButtonClick() {
      this.$reload()
    },
    toast() {
      this.$toast('hello')
      this.$bridge.hapticFeedback()
    },
    alert() {
      this.$alert('world')
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
</style>
