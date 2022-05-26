const env = require('dotenv').config().parsed
const cp = require('child_process')
cp.exec(
  `adb push "dist/." "/storage/emulated/0/Android/data/com.midea.ai.appliances/files/MideaHome/${env.DEVICE_INFO}/"`,
  (err, stdout, stderr) => {
    console.log(err, stdout, stderr)
  }
)
