export default {
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
  title(state) {
    return state.deviceInfo.deviceName || ''
  },
}
