import Vuex from 'vuex'
import { Bridge } from 'dolphin-native-bridge'
import debugUtil from '../util/debugUtil'
import { SimpleDiff } from '../util'
import { commomParam } from '../common/burialPointData'
import { DEBOUNCE_TIME, THROTTLE_TIME } from '../config'
import merge from 'lodash-es/merge.js'
import dayjs from 'dayjs'

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
    homeId(state) {
      return state.homeInfo.homeId
    },
  },
  mutations: {
    setUserInfo(state, payload) {
      state.userInfo = payload
    },
    setHomeInfo(state, payload) {
      state.homeInfo = payload
    },
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

      await Promise.all([
        dispatch('updateUserInfo'),
        dispatch('updateHomeInfo'),
        dispatch('updateDeviceDetail', { delay: 0, isShowLoading: true }),
      ])
    },
    async updateHomeInfo({ commit }) {
      const response = await Bridge.getCurrentHomeInfo().catch(() =>
        Bridge.showToast('获取家庭信息失败', 1.5)
      )
      debugUtil.log('updateHomeInfo', response)
      commit('setHomeInfo', response)
      return response
    },
    async updateUserInfo({ commit }) {
      const response = await Bridge.getUserInfo().catch(() =>
        Bridge.showToast('获取用户信息失败', 1.5)
      )

      debugUtil.log('updateUserInfo', response)

      commit('setUserInfo', response)
      return response
    },
    async updateDeviceInfo({ commit }) {
      const response = await Bridge.getDeviceInfo().catch(err => {
        debugUtil.log('updateDeviceInfo-err:', err)
        Bridge.showToast('设备信息获取失败')
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
          Bridge.showToast('设备状态获取失败')
        })
        debugUtil.log('updateDeviceDetail-res', response)
        // 安卓苹果返回的errorCode类型不一致
        if (parseInt(response.errorCode) !== 0) {
          Bridge.showToast('设备状态获取失败')
          return
        }
        commit('setDeviceDetail', response.result)
      }, delay)
      commit('setDebounceTimer', debounceTimer)
    },
    /**
     * 网关设备更新设备详情数据
     * @returns {Promise<*>}
     */
    async updateGatewayDeviceDetail({ state, dispatch, commit }) {
      let response = await dispatch(
        'getGatewayDeviceInfo',
        state.deviceInfo.deviceId
      )

      debugUtil.log('updateGatewayDeviceDetail', response)

      if (response.code === 0) {
        commit('setDeviceDetail', response.data.data)
      } else {
        Bridge.showToast('获取网关设备信息失败', 1.5)
      }
      return response
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
          Bridge.showToast('设备控制信息发送失败')
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
            Bridge.showToast('设备控制信息发送失败')
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
              Bridge.showToast('设备控制信息发送失败')
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
      { url, params = {}, option = { isShowLoading: true } }
    ) {
      const reqId = Bridge.genMessageId(),
        stamp = dayjs().format('YYYYMMDDhhmmss'),
        sendData = merge(
          {
            method: 'POST',
            data: {
              reqId,
              stamp,
              tm: stamp,
              requestId: reqId, //有的用的这个字段
            },
          },
          params
        )

      const res = await Bridge.sendCentralCloudRequest(
        url,
        sendData,
        option
      ).catch(error => {
        debugUtil.log('sendCentralCloudRequest-err', error)
        return error
      })

      debugUtil.log('sendCentralCloudRequest', url, sendData, params)
      debugUtil.log('sendCentralCloudRequest-res', res)

      return res
    },
    /**
     * 物模型指令接口封装
     * @param url 传入【/v1/appliance/operation/】后面部分的url
     * @param params 默认Post方法
     */
    async sendModelCommand({ state, dispatch }, { url, params = {} }) {
      const msgId = Bridge.genMessageId()

      const sendData = merge(
        {
          data: {
            msgId: msgId,
          },
        },
        params
      )

      const reqUrl = `/v1/appliance/operation/${url}`

      const res = await dispatch('sendCentralCloudRequest', {
        url: reqUrl,
        params: sendData,
        option: {
          isShowLoading: false,
        },
      })

      debugUtil.log('sendModelCommand-req:', reqUrl, sendData)

      debugUtil.log('sendModelCommand-res：', reqUrl, res)
      return {
        isSuccess: res.code === '0',
        ...res,
      }
    },
    /**
     * 品类服接口调用
     * @param state
     * @param params 接口业务参数
     * @param isShowLoading 是否展示loading
     * @param isDebug
     */
    async requestDataTransmit(
      { state },
      {
        params = { queryStrings: {}, transmitData: {} },
        isShowLoading = true,
        isDebug = true,
      }
    ) {
      if (isShowLoading) {
        Bridge.showLoading()
      }

      let msgId = Bridge.genMessageId()

      // 统一增加userId等公共参数
      params.type = params.type || state.deviceInfo.deviceType
      params.transmitData.userId = state.userInfo.userId
      params.transmitData.msgId = msgId
      params.transmitData.houseId = state.userInfo.homeId

      let response = await Bridge.requestDataTransmit(params).catch(err => {
        return err
      })

      if (response && response.returnData) {
        response.returnData = JSON.parse(response.returnData)
      }

      if (isDebug) {
        debugUtil.log('requestDataTransmit-params', params)
        debugUtil.log('requestDataTransmit-response', response)
      }

      if (isShowLoading) {
        Bridge.hideLoading()
      }

      if (response === 'system error') {
        Bridge.showToast('服务器异常')
      }

      // 以前有些接口还在用code，需要适配
      return {
        ...response,
        isSuccess:
          response.status === 0 &&
          response.returnData &&
          ((response.returnData.errorCode &&
            response.returnData.errorCode === '0') ||
            (response.returnData.code && response.returnData.code === '0')), // 接口规范，所有品类服接口的errorCode为字符串类型
      }
    },
    /**
     * 获取网关子设备基础信息
     */
    async getGatewayDeviceInfo({ getters, dispatch }, deviceId) {
      return dispatch('sendCentralCloudRequest', {
        url: '/v1/gateway/device/getInfo',
        params: {
          data: {
            homegroupId: getters.homeId,
            applianceCode: deviceId,
          },
        },
        option: {
          isShowLoading: false,
        },
      })
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
        Bridge.showToast('获取设备型号失败')
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
      // todo: 使用Bridge.trackEvent进行埋点
      // let res = await nativeService.commandInterfaceWrapper(params)
      // debugUtil.log('setBurialPoint-res', res)

      // return res
    },
  },
})
