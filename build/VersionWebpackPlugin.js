const path = require('path')
const fs = require('fs-extra')
const { validate } = require('schema-utils')

// 选项对象的 schema
const schema = {
  type: 'object',
  properties: {
    version: {
      type: 'string',
    },
  },
}

class VersionWebpackPlugin {
  constructor(options = {}) {
    validate(schema, options, {
      name: 'VersionWebpackPlugin',
      baseDataPath: 'options',
    })

    this.options = options
  }

  // 在插件函数的 prototype 上定义一个 `apply` 方法，以 compiler 为参数。
  apply(compiler) {
    compiler.hooks.done.tap(
      'Hello World Plugin',
      (stats /* 绑定 done 钩子后，stats 会作为参数传入。 */) => {
        console.log('Hello World!')
        const pkgPath = path.join(__dirname, '../package.json')
        let pkg = fs.readFileSync(pkgPath)
        pkg = JSON.parse(pkg)
        pkg.version = this.options.version
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
      }
    )
  }
}

module.exports = VersionWebpackPlugin
