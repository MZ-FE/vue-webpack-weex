import Vuex from 'vuex'
import { Bridge } from 'dolphin-native-bridge'
import debugUtil from '../util/debugUtil'
import { SimpleDiff } from '../util/util'
import { commomParam } from '../common/burialPointData'
import nativeService from '../js/nativeService'
import { DEBOUNCE_TIME, THROTTLE_TIME } from '../config'

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
    debounceTimer: null, // 定时器，用于防抖
    throttleTimer: null, // 节流定时
    throttleTempData: {}, // 操作缓存，用于记录上一次下发指令时的状态，下一次下发和新的状态进行对比（diff）然后下发有差异的属性
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
    setDebounceTimer(state, payload) {
      state.debounceTimer = payload
    },
    setThrottleTimer(state, payload) {
      state.throttleTimer = payload
    },
    setThrottleTempData(state, payload) {
      state.throttleTempData = payload
    },
    saveThrottleTempData(state) {
      state.throttleTempData = { ...state.deviceDetail }
    },
  },
  actions: {
    // 用于页面首次加载
    async init({ dispatch, state }) {
      await dispatch('updateDeviceInfo')
      if (state.deviceInfo.isOnline === '0') {
        return
      }
      dispatch('updateDeviceDetail', { delay: 0, isShowLoading: true })
    },
    async updateDeviceInfo({ commit }) {
      const response = await Bridge.getDeviceInfo().catch(err => {
        debugUtil.log('updateDeviceInfo-err:', err)
        Bridge.toast('设备信息获取失败')
      })
      debugUtil.log('updateDeviceInfo:', response)
      commit('setDeviceInfo', response.result)
      return response
    },
    /**
     * 查询后拿到数据延时更新
     * @param delay number 防抖延时时间：ms
     * @param isShowLoading boolean 是否显示loading
     */
    updateDeviceDetail(
      { commit, state },
      { isShowLoading = false, delay = DEBOUNCE_TIME } = {}
    ) {
      // 防抖处理
      if (state.debounceTimer) {
        clearTimeout(state.debounceTimer)
      }
      const debounceTimer = setTimeout(async () => {
        const response = await Bridge.sendLuaRequest(
          {
            operation: 'luaQuery',
            params: {},
          },
          false
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
      }, delay)
      commit('setDebounceTimer', debounceTimer)
    },
    /**
     * 发送控制指令
     * @param params 参数
     * @param isUpdateDetail boolean 发送控制后是否更新detail
     * @param isThrottle boolean 是否使用节流
     * @param controlDelay number 节流的时间参数
     */
    async luaControl(
      { dispatch, state, commit },
      {
        params = {},
        isUpdateDetail = false,
        isThrottle = true,
        controlDelay = THROTTLE_TIME,
      }
    ) {
      // 不使用节流
      if (!isThrottle) {
        debugUtil.log('luaControl params:', JSON.stringify(params))
        const res = await Bridge.sendLuaRequest(
          {
            operation: 'luaControl',
            params,
          },
          false
        ).catch(() => {
          Bridge.toast('设备控制信息发送失败')
        })
        debugUtil.log('luaControl的response.errorCode:', res.errorCode)
        if (isUpdateDetail) {
          dispatch('updateDeviceDetail')
        }
        return res
      }
      if (!state.throttleTimer) {
        // 如果定时器为null，直接下发
        debugUtil.log('luaControl params:', JSON.stringify(params))
        Bridge.sendLuaRequest(
          {
            operation: 'luaControl',
            params,
          },
          false
        )
          .then(res => {
            debugUtil.log('luaControl的response.errorCode:', res.errorCode)
          })
          .catch(() => {
            Bridge.toast('设备控制信息发送失败')
          })
        if (isUpdateDetail) {
          dispatch('updateDeviceDetail')
        }
        commit('saveThrottleTempData') // 下发之后将最新的状态保存一次
        // 一段时间之后再diff，如果有变化就下发
        const timer = setTimeout(async () => {
          const controlData = SimpleDiff(
            state.deviceDetail,
            state.throttleTempData
          )
          debugUtil.log('定时器里', controlData)
          if (!controlData) {
            // 如果diff后没有数据改变则不做下发
            commit('setThrottleTimer', null) // 清除一次定时器
            return
          }
          debugUtil.log('luaControl params:', controlData)
          Bridge.sendLuaRequest(
            {
              operation: 'luaControl',
              params: controlData,
            },
            false
          )
            .then(res => {
              debugUtil.log('luaControl的response.errorCode:', res.errorCode)
            })
            .catch(() => {
              Bridge.toast('设备控制信息发送失败')
            })
          commit('saveThrottleTempData') // 下发之后将最新的状态保存一次
          commit('setThrottleTimer', null) // 清除一次定时器
          if (isUpdateDetail) {
            dispatch('updateDeviceDetail')
          }
        }, controlDelay)
        commit('setThrottleTimer', timer)
      }
    },
    async sendCentralCloudRequest(
      { state },
      { url, params = {}, option = { isShowLoading: false } }
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
