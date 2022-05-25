const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const glob = require('glob')
const res = glob.GlobSync('./src/views/**/index.vue')

function genEntryJs() {
  const entry = {}
  // 先创建临时文件夹entry
  var entryPath = path.join(process.cwd(), '/entry')
  fs.mkdirSync(entryPath)
  // 循环生成入口js文件
  for (let name of res.found) {
    // 截取中间的路径
    const tmpPath = name
      .replace(/\.\/src\/views\//, '')
      .replace(/\/index\.vue/, '')
    // 生成entry js文件
    let entryFile = path.resolve(entryPath, tmpPath + '.js')
    fse.outputFileSync(
      entryFile,
      `import App from 'views/${tmpPath}/index.vue'
import dolphinweex from 'js/dolphinweex.js'
import exceptionReport from 'js/exceptionReport.js'
import store from '@/store'
Vue.use(dolphinweex)
Vue.use(exceptionReport)
new Vue({
  el: '#root',
  store,
  render: h => h(App),
})
`
    )
    // 加入到entry，用于提供给webpack
    entry[tmpPath] = entryFile
  }
  return entry
}

module.exports = genEntryJs()
