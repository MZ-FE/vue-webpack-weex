export default {
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
  mergeDeviceDetail(state, payload) {
    state.deviceDetail = { ...state.deviceDetail, ...payload }
  },
  setTrackInfo(state, payload) {
    Object.assign(state.trackInfo, payload)
  },
  setDeviceModel(state, payload) {
    state.otherInfo.deviceModel = payload
  },
  setThrottleTempData(state, payload) {
    state.throttleTempData = payload
  },
  setIsUpdateDeviceModel(state) {
    state.otherInfo.isUpdateDeviceModel = true
  },
  saveThrottleTempData(state) {
    state.throttleTempData = { ...state.deviceDetail }
  },
}
