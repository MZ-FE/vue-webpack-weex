/**
 * 框架基座核心方法
 */
// babel7加component插件不支持import {xxx} from 'xx'导入非组件导出内容
import Core from 'dolphin-weex-ui/packages/core'
import Utils from 'dolphin-weex-ui/packages/utils'
import { Bridge } from 'dolphin-native-bridge'
import { Log } from '../util'
import DebugWindow from '../components/DebugWindow'

export default {
  install(Vue) {
    Vue.prototype.$bus = new Vue()
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
    Vue.component('DebugWindow', DebugWindow) // 全局注册日志输出组件
  },
}
