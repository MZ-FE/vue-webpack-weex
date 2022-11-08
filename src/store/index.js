import Vuex from 'vuex'
import actions from './actions'
import getters from './getters'
import mutations from './mutations'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    deviceInfo: {},
    deviceDetail: {}, // 云端、网关端保存的当前设备信息
    userInfo: {}, // 用户信息
    homeInfo: {}, // 家庭信息
    productCode: '', // 产品型号/设备型号
    trackInfo: {
      // 埋点公共信息
      referPageName: '美居首页',
      curPageName: '',
    },
    otherInfo: {
      deviceModel: '', // 设备型号
      isUpdateDeviceModel: false, // 是否查过一次市场型号
    }, // 保存额外设备信息
    throttleTempData: {}, // 操作缓存，用于记录上一次下发指令时的状态，下一次下发和新的状态进行对比（diff）然后下发有差异的属性
    isSitEnv: weex.config.env.appEnv === 'sit',
  },
  getters,
  mutations,
  actions,
})
