// ************ debug 相关 *************
const debugUtil = {
  /**
   * 控制台日志输出封装
   * 针对weex平台调试，Android对对象进行字符串转换输出，其他平台按原类型输出
   */
  log(...params) {
    // android平台对参数进行字符串转换，方便在android studio下输出日志查看
    params = params.map(item => {
      return JSON.stringify(item, null, 2)
    })

    console.log(params.join('----'))
  },
}

export default debugUtil
