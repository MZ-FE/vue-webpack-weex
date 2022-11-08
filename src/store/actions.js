import merge from 'lodash/merge'
import dayjs from 'dayjs'
import debugUtil from '../util/debugUtil'
import { SimpleDiff } from '../util'
import { commomParam, event } from '../common/burialPointData'
import { DEBOUNCE_TIME, THROTTLE_TIME } from '../config'

let debounceTimer = null
let throttleTimer = null

export default {
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
    const response = await this._vm.$bridge
      .getCurrentHomeInfo()
      .catch(() => this._vm.$bridge.showToast('获取家庭信息失败', 1.5))
    debugUtil.log('updateHomeInfo', response)
    commit('setHomeInfo', response)
    return response
  },
  async updateUserInfo({ commit }) {
    const response = await this._vm.$bridge
      .getUserInfo()
      .catch(() => this._vm.$bridge.showToast('获取用户信息失败', 1.5))

    debugUtil.log('updateUserInfo', response)

    commit('setUserInfo', response)
    return response
  },
  async updateDeviceInfo({ commit }) {
    const response = await this._vm.$bridge.getDeviceInfo().catch(err => {
      this._vm.$log({ 'updateDeviceInfo-err:': err })
      this._vm.$bridge.showToast('设备信息获取失败')
    })

    this._vm.$log({ updateDeviceInfo: response })
    commit('setDeviceInfo', response.result)
    return response
  },
  /**
   * 查询后拿到数据延时更新
   * @param commit
   * @param delay number 防抖延时时间：ms
   * @param isShowLoading boolean 是否显示loading
   */
  updateDeviceDetail(
    { commit },
    { isShowLoading = false, delay = DEBOUNCE_TIME } = {}
  ) {
    return new Promise((resolve, reject) => {
      // 防抖处理
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      debounceTimer = setTimeout(async () => {
        const res = await this._vm.$bridge
          .sendLuaRequest(
            {
              operation: 'luaQuery',
              params: {},
            },
            isShowLoading
          )
          .catch(err => {
            debugUtil.log('updateDeviceDetail-err:', err)
            reject(err)
            this._vm.$bridge.showToast('设备状态获取失败')
          })
        debugUtil.log('updateDeviceDetail-res', res)
        // 安卓苹果返回的errorCode类型不一致
        if (parseInt(res.errorCode) !== 0) {
          this._vm.$bridge.showToast('设备状态获取失败')
          reject(res)
          return
        }
        resolve(res.result)
        commit('setDeviceDetail', res.result)
      }, delay)
    })
  },
  /**
   * 网关设备更新设备详情数据
   * @returns {Promise<*>}
   */
  async updateGatewayDeviceDetail({ state, dispatch, commit }) {
    const response = await dispatch(
      'getGatewayDeviceInfo',
      state.deviceInfo.deviceId
    )

    debugUtil.log('updateGatewayDeviceDetail', response)

    if (response.code === 0) {
      commit('setDeviceDetail', response.data.data)
    } else {
      this._vm.$bridge.showToast('获取网关设备信息失败', 1.5)
    }
    return response
  },
  /**
   * 发送控制指令
   * @param params 参数
   * @param isUpdateDetail boolean 发送控制后是否更新detail
   * @param isThrottle boolean 是否使用节流
   * @param controlDelay number 节流的时间参数
   * @param burialPointParams 埋点信息
   * @param burialPointParams.object string 埋点信息
   * @param burialPointParams.value string 埋点信息
   * @param burialPointParams.ex_value string 埋点信息
   */
  async luaControl(
    { dispatch, state, commit },
    {
      params = {},
      isUpdateDetail = false,
      isThrottle = true,
      controlDelay = THROTTLE_TIME,
      burialPointParams,
    }
  ) {
    // 通用下发指令操作
    const controlFunc = async params => {
      debugUtil.log('luaControl params:', JSON.stringify(params))
      // 埋点
      if (burialPointParams) {
        dispatch('setFuncClickCheckBurialPoint', burialPointParams)
      }
      const res = await this._vm.$bridge
        .sendLuaRequest(
          {
            operation: 'luaControl',
            params,
          },
          false
        )
        .catch(() => {
          this._vm.$bridge.showToast('设备控制信息发送失败')
        })
      debugUtil.log('luaControl的response.errorCode:', res.errorCode)
      // 埋点
      if (burialPointParams) {
        dispatch('setFuncClickResultBurialPoint', {
          ...burialPointParams,
          result: parseInt(res.errorCode) === 0 ? '成功' : '失败',
          fail_reason: parseInt(res.errorCode) === 0 ? '' : res.errorCode,
        })
      }
      if (isUpdateDetail) {
        dispatch('updateDeviceDetail')
      }
    }

    // 不使用节流
    if (!isThrottle) {
      await controlFunc(params)
      return
    }
    if (!throttleTimer) {
      // 如果定时器为null，先保存一次数据，然后下发
      commit('saveThrottleTempData')
      controlFunc(params)
      // 一段时间之后再diff，如果有变化就再次下发
      throttleTimer = setTimeout(async () => {
        const controlData = SimpleDiff(
          state.deviceDetail,
          state.throttleTempData
        )
        if (!controlData) {
          // 如果diff后没有数据改变则不做下发
          throttleTimer = null // 清除定时器id
          return
        }
        // 数据有变化，先保存一次数据，然后下发
        commit('saveThrottleTempData')
        await controlFunc(controlData)
        throttleTimer = null // 定时器逻辑执行完成，清除定时器id
      }, controlDelay)
    }
  },
  async sendCentralCloudRequest(
    _,
    { url, params = {}, option = { isShowLoading: true } }
  ) {
    const reqId = this._vm.$bridge.genMessageId()
    const stamp = dayjs().format('YYYYMMDDhhmmss')
    const sendData = merge(
      {
        method: 'POST',
        data: {
          reqId,
          stamp,
          tm: stamp,
          requestId: reqId, // 有的用的这个字段
        },
      },
      params
    )

    const res = await this._vm.$bridge
      .sendCentralCloudRequest(url, sendData, option)
      .catch(error => {
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
  async sendModelCommand({ dispatch }, { url, params = {} }) {
    const msgId = this._vm.$bridge.genMessageId()

    const sendData = merge(
      {
        data: {
          msgId,
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
      this._vm.$bridge.showLoading()
    }

    const msgId = this._vm.$bridge.genMessageId()

    // 统一增加userId等公共参数
    params.type = params.type || state.deviceInfo.deviceType
    params.transmitData.userId = state.userInfo.userId
    params.transmitData.msgId = msgId
    params.transmitData.houseId = state.userInfo.homeId

    const response = await this._vm.$bridge
      .requestDataTransmit(params)
      .catch(err => err)

    if (response && response.returnData) {
      response.returnData = JSON.parse(response.returnData)
    }

    if (isDebug) {
      debugUtil.log('requestDataTransmit-params', params)
      debugUtil.log('requestDataTransmit-response', response)
    }

    if (isShowLoading) {
      this._vm.$bridge.hideLoading()
    }

    if (response === 'system error') {
      this._vm.$bridge.showToast('服务器异常')
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
    const res = await dispatch('sendCentralCloudRequest', {
      url: '/dcp-web/api-product/message/getProductBySerialNoNew',
      params: {
        serialNo: state.deviceInfo.deviceSn,
        sourceSys: 'APP',
        tm: Math.round(new Date().getTime() / 1000),
      },
    }).catch(error => {
      commit('setIsUpdateDeviceModel')
      debugUtil.log('updateDeviceModel-err', error)
      this._vm.$bridge.showToast('获取设备型号失败')
      return error
    })
    debugUtil.log('updateDeviceModel-res', res)
    commit('setIsUpdateDeviceModel')
    if (res.data && res.data.productModels && res.data.productModels[0]) {
      const deviceModel = res.data.productModels[0]
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
    if (!state.otherInfo.deviceModel && !state.otherInfo.isUpdateDeviceModel) {
      await dispatch('updateDeviceModel')
    }

    const params = {
      event,
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

    // 自定义参数obj增量替换通用参数eventParams
    Object.assign(params.eventParams, eventParams)
    debugUtil.log('setBurialPoint-params', params)
    this._vm.$bridge.trackEvent(params)
  },
  /**
   * plugin_function_click_check埋点
   * @param dispatch
   * @param burialPointParams 埋点信息
   * @param burialPointParams.object string 埋点信息
   * @param burialPointParams.value string 埋点信息
   * @param burialPointParams.ex_value string 埋点信息
   */
  setFuncClickCheckBurialPoint({ dispatch }, burialPointParams) {
    dispatch('setBurialPoint', {
      event: event.plugin_function_click_check,
      eventParams: {
        object: burialPointParams.object,
        ex_value: burialPointParams.ex_value,
        value: burialPointParams.value,
        is_legal: '是',
      },
    })
  },
  /**
   * plugin_function_click_result埋点
   * @param dispatch
   * @param burialPointParams 埋点信息
   * @param burialPointParams.object string 埋点信息
   * @param burialPointParams.value string 埋点信息
   * @param burialPointParams.ex_value string 埋点信息
   * @param burialPointParams.result string 控制结果
   * @param burialPointParams.fail_reason string 失败原因
   */
  setFuncClickResultBurialPoint({ dispatch }, burialPointParams) {
    dispatch('setBurialPoint', {
      event: event.plugin_function_click_result,
      eventParams: {
        object: burialPointParams.object,
        ex_value: burialPointParams.ex_value,
        value: burialPointParams.value,
        result: burialPointParams.result,
        fail_reason: burialPointParams.fail_reason,
      },
    })
  },
}
