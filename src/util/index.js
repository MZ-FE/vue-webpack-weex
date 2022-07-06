// 延时
export function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

export function getParameterByName(name) {
  const url = this.$getConfig().bundleUrl
  name = name.replace(/[\[\]]/g, '\\$&')
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url)
  if (!results) return null
  if (!results[2]) return ''
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
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
    !Object.prototype.toString.call(newObj) === '[object Object]' ||
    !Object.prototype.toString.call(oldObj) === '[object Object]'
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
