const dayjs = require('dayjs')
const compressing = require('compressing')
const path = require('path')
const fse = require('fs-extra')
const env = require('dotenv').config().parsed

;(async () => {
  const pluginZipName = `${env.DEVICE_INFO}_${dayjs().format('YYYYMMDD')}00.zip` // 插件包名称
  const distPath = path.resolve(__dirname, `../dist/${env.DEVICE_INFO}`) // 打包产物目录
  const releasePath = path.resolve(__dirname, '../release')
  const cachePath = path.resolve(releasePath, env.DEVICE_INFO) // 复制缓存目录
  const pluginZipPath = path.resolve(releasePath, pluginZipName) // 打ziip包目标目录

  try {
    await fse.copy(distPath, cachePath) // 复制 dist 目录到临时目录
    await compressing.zip.compressDir(cachePath, pluginZipPath)
    await fse.remove(cachePath) // 清理临时文件
    console.log('插件打包成功')
  } catch (err) {
    console.log(`插件打包失败`, err)
  }
})()
