import Vuex from 'vuex'
import { Bridge } from 'dolphin-native-bridge'
import debugUtil from '../util/debugUtil'
import { delay } from '../util/util'
import { commomParam } from '../common/burialPointData'
import nativeService from '../js/nativeService'

Vue.use(Vuex)
export default new Vuex.Store({
  state: {
    title: 'Dolphin Weex',
    deviceInfo: {},
    deviceDetail: {},
    productCode: '', // 产品型号/设备型号
    trackInfo: {
      // 埋点公共信息
      referPageName: '美居首页',
      curPageName: '',
    },
    otherInfo: {
      deviceModel: '', // 设备型号
    }, // 保存额外设备信息
  },
  getters: {
    isDeviceInfoInit(state) {
      return Object.keys(state.deviceInfo).length !== 0
    },
    isDeviceDetailInit(state) {
      return Object.keys(state.deviceDetail).length !== 0
    },
    isOnline(state) {
      return state.deviceInfo.isOnline && state.deviceInfo.isOnline === '1'
    },
  },
  mutations: {
    setDeviceInfo(state, payload) {
      state.deviceInfo = payload
    },
    setDeviceDetail(state, payload) {
      state.deviceDetail = payload
    },
    setTrackInfo(state, payload) {
      Object.assign(state.trackInfo, payload)
    },
    setDeviceModel(state, payload) {
      state.otherInfo.deviceModel = payload
    },
  },
  actions: {
    async updateDeviceInfo({ commit }) {
      const response = await Bridge.getDeviceInfo().catch(err => {
        debugUtil.log('updateDeviceInfo-err:', err)
        Bridge.toast('设备信息获取失败')
      })
      debugUtil.log('updateDeviceInfo:', response)
      commit('setDeviceInfo', response.result)
      return response
    },
    async updateDeviceDetail({ commit }, { isShowLoading = false } = {}) {
      const response = await Bridge.sendLuaRequest(
        {
          operation: 'luaQuery',
          params: {},
        },
        isShowLoading
      ).catch(err => {
        debugUtil.log('updateDeviceDetail-err:', err)
        Bridge.toast('设备状态获取失败')
      })
      debugUtil.log('updateDeviceDetail-res', response)
      // 安卓苹果返回的errorCode类型不一致
      if (parseInt(response.errorCode) !== 0) {
        Bridge.toast('设备状态获取失败')
        return
      }
      commit('setDeviceDetail', response.result)
      return response
    },
    async luaControl(
      { dispatch },
      { params = {}, updateDetail = true, updateDelay = 0 }
    ) {
      debugUtil.log('luaControl params:', JSON.stringify(params))
      Bridge.showLoading()
      const response = await Bridge.sendLuaRequest(
        {
          operation: 'luaControl',
          params,
        },
        false
      ).catch(() => Bridge.toast('设备控制信息发送失败'))
      debugUtil.log('luaControl的response:', JSON.stringify(response))
      if (updateDetail) {
        // 立刻查有可能会拿到未更新的值，如果有发现获取的值还未更新，可以调整updateDelay的值或者与电控沟通解决a
        await delay(updateDelay)
        await dispatch('updateDeviceDetail')
      }
      Bridge.hideLoading()
      return response
    },
    async sendCentralCloudRequest(
      { state },
      { url, params = {}, option = { isShowLoading: true } }
    ) {
      debugUtil.log('sendCentralCloudRequest', url, params)

      let res = await Bridge.sendCentralCloudRequest(
        url,
        {
          method: 'POST',
          data: params,
        },
        option
      ).catch(error => {
        debugUtil.log('sendCentralCloudRequest-err', url, error)
        return error
      })

      debugUtil.log('sendCentralCloudRequest-res', url, res)

      return res
    },
    /**
     * 获取产品型号信息
     */
    async updateDeviceModel({ state, commit, dispatch }) {
      let res = await dispatch('sendCentralCloudRequest', {
        url: '/dcp-web/api-product/message/getProductBySerialNoNew',
        params: {
          serialNo: state.deviceInfo.deviceSn,
          sourceSys: 'APP',
          tm: Math.round(new Date().getTime() / 1000),
        },
        option: {
          isShowLoading: false,
        },
      }).catch(error => {
        debugUtil.log('updateDeviceModel-err', error)
        Bridge.toast('获取设备型号失败')
        return error
      })
      debugUtil.log('updateDeviceModel-res', res)
      if (res.data && res.data.productModels && res.data.productModels[0]) {
        let deviceModel = res.data.productModels[0]
        debugUtil.log('deviceModel', deviceModel)
        commit('setDeviceModel', deviceModel)
      }
      return res
    },
    /**
     * 埋点
     * @param event   事件名
     * @param eventParams  自定义属性
     */
    async setBurialPoint({ state, dispatch }, { event, eventParams }) {
      debugUtil.log('state.otherInfo', state.otherInfo)
      // 获取型号信息
      if (!state.otherInfo.deviceModel) {
        await dispatch('updateDeviceModel')
      }

      let params = {
        operation: 'trackEvent',
        event: event,
        eventParams: {
          ...commomParam,
          widget_name: `${state.deviceInfo.deviceType}_${state.deviceInfo.deviceSn8}`, // 插件包名称
          widget_version: PLUGIN_VERSION, // 插件包版本号
          widget_cate: state.deviceInfo.deviceType, // 设备品类代码
          widget_type: state.otherInfo.deviceModel,
          sn8: state.deviceInfo.deviceSn8, // SN8
          iot_device_id: state.deviceInfo.deviceId, // 15位设备ID
          page_name: state.trackInfo.curPageName,
        },
      }

      //自定义参数obj增量替换通用参数eventParams
      Object.assign(params.eventParams, eventParams)
      debugUtil.log('setBurialPoint-params', params)
      let res = await nativeService.commandInterfaceWrapper(params)
      debugUtil.log('setBurialPoint-res', res)

      return res
    },
  },
})
