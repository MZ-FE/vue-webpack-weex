const env = require('dotenv').config().parsed
const cp = require('child_process')

for (const sn8OrA0 of env.SN8_OR_A0_LIST.split(',')) {
  console.log(
    'push to ' +
    `/storage/emulated/0/Android/data/com.midea.ai.appliances/files/MideaHome/${env.PLUGIN_TYPE}_${sn8OrA0}/`
  )
  cp.exec(
    `adb push "dist/." "/storage/emulated/0/Android/data/com.midea.ai.appliances/files/MideaHome/${env.PLUGIN_TYPE}_${sn8OrA0}/"`,
    (err, stdout) => {
      if (err) {
        console.log('adb推送失败：', stdout)
      }
    }
  )
}
