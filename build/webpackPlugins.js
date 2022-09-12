const dayjs = require('dayjs')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const env = require('dotenv').config().parsed
const _ = require('lodash')
const CopyPlugin = require('copy-webpack-plugin')
const VersionWebpackPlugin = require('./VersionWebpackPlugin')
const WebpackBar = require('webpackbar');

const pageName = {}
Object.keys(env).forEach(key => {
  if (key.startsWith('PAGE_')) {
    pageName[_.camelCase(key.slice(5))] = env[key]
  }
})

const PLUGIN_VERSION = JSON.stringify(dayjs().format('YYYY.MMDD.HHmm'))

module.exports = [
  new CopyPlugin({
    patterns: [{ from: 'public', to: 'public' }],
  }),
  new webpack.DefinePlugin({
    PLUGIN_VERSION,
    PAGE_NAME: JSON.stringify(pageName),
    APPTYPE_NAME: JSON.stringify(env.APPTYPE_NAME),
  }),
  new CleanWebpackPlugin(),
  new webpack.BannerPlugin({
    banner: '// { "framework": "Vue" }\n',
    raw: true,
  }),
  new VersionWebpackPlugin({
    version: JSON.parse(PLUGIN_VERSION),
  }),
  new WebpackBar()
]
