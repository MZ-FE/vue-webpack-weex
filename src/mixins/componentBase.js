import { mapActions } from 'vuex'
import { Bridge } from 'dolphin-native-bridge'
import { getParameterByName } from '../util'

// 子组件的基础混入
export default {
  methods: {
    ...mapActions(['updateDeviceInfo', 'updateDeviceDetail', 'setBurialPoint']),
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
    getParameterByName,
  },
}
