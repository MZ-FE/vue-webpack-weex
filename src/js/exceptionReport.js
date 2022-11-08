import { Bridge } from 'dolphin-native-bridge'
import debugUtil from '../util/debugUtil'
import { Log } from '../util'
/**
 *
 * @param {any} err
 * @param {any} vm
 * @param {string} info
 */
function errorHandler(err, vm, info) {
  const INFO_CONTENT = {
    path: weex.config.bundleUrl,
    env: weex.config.env.appEnv,
    errorDesc: err.toString(),
    errDetail: JSON.stringify(err),
    info,
    stack: err.stack,
  }
  const errorMessage = {
    stack: [INFO_CONTENT.path, INFO_CONTENT.errorDesc, INFO_CONTENT.info],
    extraInfo: {
      timeStamp: formatDate(),
      errTxt: INFO_CONTENT.errDetail,
    },
  }
  debugUtil.log('全局捕获err', INFO_CONTENT)
  Log.bind(vm)('全局捕获err', INFO_CONTENT)
  // 报错埋点
  try {
    Bridge.reportError(errorMessage)
  } catch (error) {
    console.error(error)
  }
}
/**
 *
 * @param {string} format 日期格式
 * @param {string} timeStamp 时间戳
 */
function formatDate(format = 'Y-M-D h:m:s', timeStamp = Date.now()) {
  const date = new Date(timeStamp)
  const dateInfo = {
    Y: date.getFullYear(),
    M: date.getMonth() + 1,
    D: date.getDate(),
    h: date.getHours(),
    m: date.getMinutes(),
    s: date.getSeconds(),
  }
  const formatNumber = n => (n > 10 ? n : `0${n}`)
  const res = format
    .replace('Y', dateInfo.Y)
    .replace('M', dateInfo.M)
    .replace('D', dateInfo.D)
    .replace('h', formatNumber(dateInfo.h))
    .replace('m', formatNumber(dateInfo.m))
    .replace('s', formatNumber(dateInfo.s))

  return res
}
export default {
  install(Vue) {
    Vue.config.errorHandler = errorHandler
    Vue.prototype.$throw = function (error) {
      errorHandler(error, Vue)
    }
  },
}
