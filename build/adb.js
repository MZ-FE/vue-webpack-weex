const env = require('dotenv').config().parsed
const cp = require('child_process')
console.log('push to ' + `/storage/emulated/0/Android/data/com.midea.ai.appliances/files/MideaHome/${env.DEVICE_INFO}/`)
cp.exec(
  `adb push "dist/${env.DEVICE_INFO}/." "/storage/emulated/0/Android/data/com.midea.ai.appliances/files/MideaHome/${env.DEVICE_INFO}/"`,
  (err) => {
    if (err) {
      console.log('adb推送失败：', err)
    }
  }
)
