/**
 * 框架基座核心方法
 */
import Core from 'dolphin-weex-ui/packages/core'
import Utils from 'dolphin-weex-ui/packages/utils'
import { Bridge } from 'dolphin-native-bridge'
let dolphinweex = {
  install(Vue, options) {
    Vue.prototype.$bridge = Bridge
    Vue.prototype.$util = Utils
    Vue.prototype.$alert = Core.alert
    Vue.prototype.$toast = Core.toast
    Vue.prototype.$reload = Core.reload
    Vue.prototype.$confirm = Core.confirm
    Vue.prototype.$showSuccess = Core.showSuccess
    Vue.prototype.$showError = Core.showError
    Vue.prototype.$getContextPath = Core.getContextPath
    Vue.prototype.$push = Bridge.push
    Vue.prototype.$pop = Bridge.pop
    Vue.prototype.$storage = Core.storage
  },
}

export default dolphinweex
