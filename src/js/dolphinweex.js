/**
 * 框架基座核心方法
 */
import { Core, Utils } from 'dolphin-weex-ui'
import { Bridge } from 'dolphin-native-bridge'
import { Log } from '@/util'
import Debug from '@/components/Debug'

export default {
  install(Vue) {
    const Bus = new Vue()
    Vue.prototype.$bus = Bus
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

    Vue.prototype.$log = Log.bind(Vue.prototype) // 全局绑定日志输出方法
    Vue.component('Debug', Debug) // 全局注册日志输出组件
  },
}
