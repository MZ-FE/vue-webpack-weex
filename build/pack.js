const compressing = require('compressing')
const path = require('path')
const fse = require('fs-extra')
const env = require('dotenv').config().parsed
const { getPluginSuffix, getWidgetVersion } = require('./utils')

;(() => {
  const { SN8_OR_A0_LIST, PLUGIN_TYPE } = env
  const pluginVersion = getPluginSuffix()
  const distPath = path.resolve(__dirname, '../dist') // 打包产物目录
  const releasePath = path.resolve(__dirname, '../release')

  const pack = async sn8 => {
    {
      const plugin_dir = sn8 ? `${PLUGIN_TYPE}_${sn8}` : PLUGIN_TYPE
      const cachePath = path.resolve(releasePath, plugin_dir) // 缓存目录
      const pluginZipName = `${plugin_dir}_${pluginVersion}.zip` // 插件包名称
      const pluginZipPath = path.resolve(releasePath, pluginZipName) // zip包目标目录

      try {
        console.log(`✔ 复制 ${distPath} 到临时目录 ${cachePath}`)
        await fse.copy(distPath, cachePath)

        console.log(`✔ 压缩到 ${pluginZipPath}`)
        await compressing.zip.compressDir(cachePath, pluginZipPath)

        console.log(`✔ 删除临时文件 ${cachePath}`)
        await fse.remove(cachePath)

        console.log(`» 插件包版本：${getWidgetVersion()}`)
        console.log(`» 插件包后缀：${pluginVersion}`)
        console.log(`✔ 插件打包成功：${pluginZipName}`)
      } catch (err) {
        console.log('✗ 插件打包失败', err)
      }
    }
  }

  // 遍历并打包
  if (SN8_OR_A0_LIST) {
    SN8_OR_A0_LIST.split(',').forEach(sn8 => pack(sn8))
  } else {
    pack()
  }
})()
