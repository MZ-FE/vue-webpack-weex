/**
 * @description 公共配置
 */

const path = require('path')
const fse = require('fs-extra')
const dayjs = require('dayjs')

// 根据当前日期生成插件包后缀
const getPluginSuffix = () => `${dayjs(new Date()).format('YYYYMMDD')}00`

// 根据当前日期生成时间戳
const getTimeStr = () => dayjs().format('HH:mm:ss')

// 从 package.json 获取插件版本号
const getWidgetVersion = () => {
  const pkgPath = path.join(__dirname, '../package.json')
  const pkg = JSON.parse(fse.readFileSync(pkgPath)) || {}
  return pkg.version
}

module.exports = {
  getTimeStr,
  getPluginSuffix,
  getWidgetVersion,
}
