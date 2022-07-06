/**
 * 框架基座核心方法
 */
const stream = weex.requireModule('stream')
import { DofMinibar, Core, Utils } from 'dolphin-weex-ui'
import { Bridge } from 'dolphin-native-bridge'
let dolphinweex = {
  /**
   * 发送GET请求
   * @method get
   * @param params {object} 请求参数
   * @param params.url {string} 请求的URL
   * @param params.headers {object} 请求头
   * @param params.type {string} 响应类型, json(默认),text
   * @param params.data {object} 请求数据，自动拼接到url后面
   * @param params.timeout {int} 超时时间 默认30s
   * @return {Promise.<TResult>} 成功: resolve(data, status, statusText), 失败: reject(status, statusText)
   */
  get(params) {
    return new Promise((resolve, reject) => {
      let url = params.url || ''
      let headers = params.headers || {}
      let data = params.data || {}
      let type = params.type || 'json'
      if (url.indexOf('?') < 0) {
        url += '?'
      }
      if (typeof data == 'object') {
        let dLength = Object.keys(data).length
        for (let i = 0; i < dLength; i++) {
          let key = Object.keys(data)[i]
          let value = encodeURIComponent(data[key])
          url += `${key}=${value}`
          if (i != dLength - 1) {
            url += '&'
          }
        }
      }
      stream.fetch(
        {
          method: 'GET',
          type: type,
          url: url,
          headers: headers,
          timeout: params.timeout || 30000,
        },
        res => {
          if (res.status >= 200 && res.status <= 299) {
            resolve(res.data, res.status, res.statusText, res)
          } else {
            reject(res.status, res.statusText)
          }
        }
      )
    })
  },
  /**
   * 发送POST请求
   * @method post
   * @param params {object} 请求参数
   * @param params.url {string} 请求的URL
   * @param params.headers {object} 请求头, Content-Type默认值是 application/x-www-form-urlencoded
   * @param params.type {string} 响应类型, json(默认),text
   * @param params.data {object} 请求数据，带到 HTTP body中
   * @param params.timeout {int} 超时时间 默认30s
   * @return {Promise.<TResult>} 成功: resolve(data, status, statusText), 失败: reject(status, statusText)
   */
  post(params) {
    let url = params.url || ''
    let headers = params.headers || {}
    let data = params.data
    let type = params.type || 'json'
    if (typeof data == 'object') {
      data = JSON.stringify(data)
    }
    // headers["Content-Type"]="application/x-www-form-urlencoded";
    // headers["Content-Type"]="application/json";
    return new Promise((resolve, reject) => {
      stream.fetch(
        {
          method: 'POST',
          type: type,
          url: url,
          headers: headers,
          body: data,
          timeout: params.timeout || 30000,
        },
        res => {
          if (res.status >= 200 && res.status <= 299) {
            resolve(res.data, res.status, res.statusText, res)
          } else {
            reject(res.status, res.statusText)
          }
        }
      )
    })
  },
  install(Vue, options) {
    Vue.prototype.$native = Bridge
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
  },
}

module.exports = dolphinweex
