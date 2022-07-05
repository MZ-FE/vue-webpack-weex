const env = require('dotenv').config().parsed
const cp = require('child_process')

if (env.NON_STANDARD_DEVICE === 'false') {
  // 标准设备
  console.log(
    'push to ' +
      `/storage/emulated/0/Android/data/com.midea.ai.appliances/files/MideaHome/${env.DEVICE_INFO}/`
  )
  cp.exec(
    `adb push "dist/${env.DEVICE_INFO}/." "/storage/emulated/0/Android/data/com.midea.ai.appliances/files/MideaHome/${env.DEVICE_INFO}/"`,
    err => {
      if (err) {
        console.log('adb推送失败：', err)
      }
    }
  )
} else {
  // 使用A0的非标设备
  for (const a0 of env.A0_LIST.split(',')) {
    console.log(
      'push to ' +
        `/storage/emulated/0/Android/data/com.midea.ai.appliances/files/MideaHome/${env.PLUGIN_TYPE}_${a0}/`
    )
    cp.exec(
      `adb push "dist/." "/storage/emulated/0/Android/data/com.midea.ai.appliances/files/MideaHome/${env.PLUGIN_TYPE}_${a0}/"`,
      err => {
        if (err) {
          console.log('adb推送失败：', err)
        }
      }
    )
  }
}
