const chalk = require('chalk')
const process = require('child_process')
const path = require('path')
const env = require('dotenv').config().parsed
const { getTimeStr, getWidgetVersion } = require('./utils')

const {
  PUSH_AFTER_DONE,
  SN8_OR_A0_LIST,
  PLUGIN_TYPE,
  ADB_PREFIX,
  ADB_APP_PATH,
  IOS_PREFIX,
  IOS_APP_PATH,
} = env

const ends = PUSH_AFTER_DONE.split(',') // 需要推送到的手机终端
const version = 'V ' + getWidgetVersion()

const path_suffix = global.process.platform === 'linux' ? '/.' : '\\.' // Windows 和 linux 不兼容
const dist_path = `${path.resolve(__dirname, '../dist')}${path_suffix}` // 编译输出路径

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
    const time = chalk.bgBlueBright(getTimeStr())
    const dist_path_txt = chalk.blueBright.italic(dist_path)

    // 写入安卓
    const adb_path = `${ADB_PREFIX}${ADB_APP_PATH}${plugin_dir}`
    const adb_path_txt = chalk.greenBright.italic(dist_path)
    const adb_exec = `adb push ${dist_path} ${adb_path}`
    const adb_echo = `${time} adb push ${dist_path_txt} ${adb_path_txt} ${version_txt}`
    if (ends.includes('adb')) {
      pushFunc(adb_exec, adb_echo)
    }

    // 写入 iOS
    const ios_path = `${IOS_PREFIX}${IOS_APP_PATH}${plugin_dir}`
    const ios_path_txt = chalk.greenBright.italic(ios_path)

    const ios_exec = `cp -rf ${dist_path} ${ios_path}`
    const ios_echo = `${time} cp -rf ${dist_path_txt} ${ios_path_txt} ${version_txt}`
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
