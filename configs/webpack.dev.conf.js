const commonConfig = require('./webpack.common.conf')
const webpackMerge = require('webpack-merge') // used to merge webpack configs
const webpack = require('webpack')
// tools

/**
 * Webpack Plugins
 */
const HtmlWebpackPlugin = require('html-webpack-plugin-for-multihtml')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')

const project_category_name = process.env.CATE_NAME || 'demo'

const config = require('./config')
const utils = require('./utils')
const helper = require('./helper')

/**
 * Generate multiple entrys
 * @param {Array} entry
 */
const generateHtmlWebpackPlugin = entry => {
  let entrys = Object.keys(entry)
  // exclude vendor entry.
  entrys = entrys.filter(entry => entry !== 'vendor')
  const htmlPlugin = entrys.map(name => {
    return new HtmlWebpackPlugin({
      multihtmlCache: true,
      filename: name + '.html',
      template: helper.rootNode(`web/index.html`),
      isDevServer: true,
      chunksSortMode: 'dependency',
      inject: true,
      devScripts: config.dev.htmlOptions.devScripts,
      chunks: ['vendor', name],
    })
  })
  return htmlPlugin
}

/**
 * Webpack configuration for weex.
 */
const weexConfig = webpackMerge(commonConfig, {
  plugins: [
    /**
     * Plugin: webpack.DefinePlugin
     * Description: The DefinePlugin allows you to create global constants which can be configured at compile time.
     *
     * See: https://webpack.js.org/plugins/define-plugin/
     */
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: config.dev.env,
      },
    }),
  ],
  watch: true,
})

// build source to weex_bundle with watch mode.
webpack(weexConfig, (err, stats) => {
  if (err) {
    console.err('COMPILE ERROR:', err.stack)
  }
})

module.exports = weexConfig
