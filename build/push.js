const chalk = require('chalk')
const process = require('child_process')
const path = require('path')
const env = require('dotenv').config().parsed
const { getTimeStr, getWidgetVersion } = require('./utils')

const { PUSH_AFTER_DONE, SN8_OR_A0_LIST, PLUGIN_TYPE } = env
const ends = PUSH_AFTER_DONE.split(',') // 需要推送到的手机终端
const version = 'V ' + getWidgetVersion()
const timeStr = getTimeStr()

const path_suffix = global.process.platform === 'linux' ? '/.' : '\\.' // Windows 和 linux 不兼容
const dist_path = `${path.resolve(__dirname, '../dist')}${path_suffix}` // 编译输出路径
const adb_prefix = '/storage/emulated/0/Android/data'
const adb_app_path = '/com.midea.ai.appliances/files/MideaHome/'
const ios_prefix =
  '/run/user/1000/gvfs/afc:host=78d1f717dc0fe15fd6209e461892fad9cc356a49,port=3' // 不同系统或设备有差异时修改此处
const ios_app_path = '/com.msmart.meiju.inhouse/5.0Plugins/'

// 推送文件的方法
const pushFunc = (ex, ec) => {
  process.exec(ex, (error, stdout) => {
    console.log(ec)
    if (error) {
      console.log(chalk.redBright.bold(error))
    } else {
      console.log(`✔ ${stdout || '推送完毕'}`)
    }
  })
}

// 遍历 SN8_OR_A0_LIST 并执行推送
const pushToEnds = () => {
  if (!SN8_OR_A0_LIST) {
    return
  }
  SN8_OR_A0_LIST.split(',').forEach(sn8 => {
    const plugin_dir = `${PLUGIN_TYPE}_${sn8}`
    const version_txt = chalk.yellowBright.bold(version)
    const time = chalk.bgBlueBright(timeStr)
    const dist_path_txt = chalk.blueBright.italic(dist_path)

    // 写入安卓
    const adb_path = `${adb_prefix}${adb_app_path}${plugin_dir}`
    const adb_path_txt = chalk.greenBright.italic(dist_path)
    const adb_exec = `adb push ${dist_path} ${adb_path}`
    const adb_echo = `${time}adb push ${dist_path_txt} ${adb_path_txt} ${version_txt}`
    if (ends.includes('adb')) {
      pushFunc(adb_exec, adb_echo)
    }

    // 写入 iOS
    const ios_path = `${ios_prefix}${ios_app_path}${plugin_dir}`
    const ios_path_txt = chalk.greenBright.italic(ios_path)

    const ios_exec = `cp -rf ${dist_path} ${ios_path}`
    const ios_echo = `${time}cp -rf ${dist_path_txt} ${ios_path_txt} ${version_txt}`
    if (ends.includes('ios')) {
      pushFunc(ios_exec, ios_echo)
    }
  })
}

// nodejs 直接调用本文件执行
if (global.process.argv[1].indexOf('push.js') > 0) {
  pushToEnds()
}

module.exports = pushToEnds
