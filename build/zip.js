const dayjs = require('dayjs')
const compressing = require('compressing')
const path = require('path')
const fse = require('fs-extra')
const env = require('dotenv').config().parsed

;(async () => {
  for (const sn8OrA0 of env.SN8_OR_A0_LIST.split(',')) {
    const pkgPath = path.join(__dirname, '../package.json')
    let pkg = fse.readFileSync(pkgPath)
    pkg = JSON.parse(pkg)
    const pluginZipName = `${env.PLUGIN_TYPE}_${sn8OrA0}_${pkg.version}.zip` // 插件包名称
    const distPath = path.resolve(__dirname, `../dist`) // 打包产物目录
    const releasePath = path.resolve(__dirname, '../release')
    const cachePath = path.resolve(releasePath, `${env.PLUGIN_TYPE}_${sn8OrA0}`) // 复制缓存目录
    const pluginZipPath = path.resolve(releasePath, pluginZipName) // 打zip包目标目录

    try {
      await fse.copy(distPath, cachePath) // 复制 dist 目录到临时目录
      await compressing.zip.compressDir(cachePath, pluginZipPath)
      await fse.remove(cachePath) // 清理临时文件
      console.log('插件打包成功')
    } catch (err) {
      console.log(`插件打包失败`, err)
    }
  }
})()
