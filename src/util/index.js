export const isObject = obj =>
  Object.prototype.toString.call(obj) === '[object Object]'

// 延时，不传参数时类似 this.$nextTick
export function delay(ms = 0) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

export function getParameterByName(name) {
  const url = this.$getConfig().bundleUrl
  name = name.replace(/[\[\]]/g, '\\$&')
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`)
  const results = regex.exec(url)
  if (!results) return null
  if (!results[2]) return ''
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

// 取 weex 页面的文件名（不带后缀）
export const getPageName = () => {
  const pattern = /.*\/(.*).js/
  return weex.config.bundleUrl.match(pattern)[1]
}

/**
 * 简易diff，返回包含有变化的属性的对象
 * @param newObj Object 新的对象
 * @param oldObj Object 旧的对象
 * @return Object | Null 有变化的属性，如果没有变化返回null
 */
export function SimpleDiff(newObj, oldObj) {
  const ret = {}
  if (
    !(Object.prototype.toString.call(newObj) === '[object Object]') ||
    !(Object.prototype.toString.call(oldObj) === '[object Object]')
  ) {
    return null
  }
  for (const [key, val] of Object.entries(newObj)) {
    if (oldObj[key] && oldObj[key] !== val) {
      ret[key] = val
    }
  }
  if (JSON.stringify(ret) === '{}') {
    return null
  }
  return ret
}

/**
 * @title 对象属性排序
 * @description 按key的字母顺序进行重排，如果是多层对象，则分别递归处理
 * @param {array|object|string} obj 要处理的数据
 * @returns object
 */
export const sortObj = obj => {
  if (Array.isArray(obj)) {
    return obj.map(item => sortObj(item))
  }
  // 除数组以外的对象数据
  if (isObject(obj)) {
    const keysArray = Object.keys(obj).sort()
    const newObj = {}
    keysArray.forEach(key => {
      const value = obj[key]
      newObj[key] = sortObj(value)
    })
    return newObj
  }
  // 非对像数据，原样返回

  return obj
}

/**
 * !! this 通过 bind 指向 Vue.prototype
 * !! 若 this 不存在，即调用场景不支持 `this.$bridge` 等方法时，则自动使用 `console.log` 输出
 * @description 格式化日志输出，带数据排序功能，支持多条日志同时输出
 * @param {Array} params 数组形式传入日志列表，其中params[1]包含设置项
 * @param {Boolean} params[1].isExpanded 是否展开日志内容；为 `true` 时，带缩进空格格式化展开；为 `false` 时以紧凑字符串的形式输出
 * @param {Array} params[1].logType 日志输出方式 bridge || pageview || alert || console
 * @param {String} params[1].level 日志级别 Debug || Info || Warn || Error
 *
 * bridge 默认值，基于 `this.$bridge.log` 输出，带日志级别 // ! 支持展开日志
 * -- IOS 使用‘美居-设置-关于美的美居-测试使用-日志可视化工具’；安卓 logcat 过滤 `NativeInterface: >`
 *
 * console 基于 `console.log` 的常规日志输出 // ! 支持展开日志
 * -- 安卓 logcat过滤 `jsLog`；iOS 调试浮球进入log查看
 *
 * pageview 基于 `<ipc-debug />` 及 `this.$bug.$emit("log")` // ! 不支持展开日志
 * -- 在插件页上以浮层滚动输出，数据局限在当前页面
 *
 * alert 基于 `this.$alert` 输出 // ! 不支持展开日志
 */
export async function Log(...params) {
  // try-catch 日志输出出现异常时，避免正常业务功能堵塞
  try {
    // 从第二个参数 params[1] 中提取日志输出设置项
    const {
      isExpanded = true,
      logType = ['bridge', 'pageview'],
      level = 'Info',
    } = params[1] || {}

    // 格式化日志数组，alert 及 pageview 模式直接使用此数据输出
    const message = params.map(item => {
      if (typeof item !== 'object') {
        return item
      }
      const _copy = JSON.parse(JSON.stringify(item)) // 伪深拷贝，去掉不可枚举的属性
      return sortObj(_copy) // 按字母顺序整理日志数据项
    })

    const pageName = getPageName()

    const msg_split = message.map(item => {
      if (typeof item !== 'string') {
        return JSON.stringify(item, null, isExpanded ? 2 : 0)
      }
      return item
    })

    // 各条日志之间的分隔符
    const SPLITER = `\n$>---- Next Slice of ${pageName}.js ----\n`

    // 基于 pageview，页面浮层
    if (logType.includes('pageview') && !!this) {
      await delay() // HACK 可能存在渲染冲突，导致日志无法正常输出，等待下一轮渲染
      this.$bus.$emit('log', message)
    }

    // 基于 alert 弹窗
    if (logType.includes('alert') && !!this) {
      this.$alert(message)
    }

    // 基于 this.$bridge.log
    if (logType.includes('bridge') && !!this) {
      const prefix = `\n$>===== Beginning of ${pageName}.js =====\n`
      const str = msg_split.map(item => `>${item}`).join(SPLITER)
      this.$bridge.log({ message: `${prefix}${str}`, level })
    }

    // 基于 console.log
    if (logType.includes('console') || (logType.includes('bridge') && !this)) {
      const str = msg_split.join(SPLITER)

      // 每页的字符长度。原生输出日志长度限制为1024字节，路径及各种前缀又占了一部分长度
      const BUFFER_SIZE = 880

      // 不必分片，直接输出
      if (str.length <= BUFFER_SIZE) {
        const prefix = `\n===== Beginning of ${pageName}.js =====\n`
        console.log(`${prefix}${str}`)
      }
      // 分片输出
      else {
        let i = 0
        while (str.length > BUFFER_SIZE * i) {
          const prefix = `\n==== ${pageName}.js: page:${i + 1}, chars:${
            str.length
          } ====\n`
          console.log(
            `${prefix}${str.slice(BUFFER_SIZE * i, BUFFER_SIZE * ++i)}`
          )
        }
      }
    }
  } catch (err) {}
}
