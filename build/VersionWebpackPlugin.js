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

  apply(compiler) {
    compiler.hooks.done.tap(
      'EditPackageJSONVersionPlugin',
      () => {
        console.log('\n打包完成，更新package.json!')
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
