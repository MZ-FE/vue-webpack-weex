/**
 * [ENV description]
 * @type {Number}
 * 1 开发环境
 * 2 sit环境
 * 3 生产环境
 */

let baseURL
let ENV = 2

switch (ENV) {
  case 1:
    // dev开发环境
    baseURL = 'http://127.0.0.1:8899/'
    break
  case 2:
    // sit测试环境
    baseURL = 'http://127.0.0.1:8899/'
    break
  case 3:
    // 正式环境
    baseURL = 'http://127.0.0.1:8899/'
    break
  default:
    // statements_def
    baseUrl = 'http://127.0.0.1:8899/'
    break
}

export { baseURL, ENV }
