const dayjs = require('dayjs')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = [
  new webpack.DefinePlugin({
    PLUGIN_VERSION: JSON.stringify(dayjs().format('YYYY.MMDD.HHmm')),
  }),
  new CleanWebpackPlugin(),
  new webpack.BannerPlugin({
    banner: '// { "framework": "Vue" }\n',
    raw: true,
  }),
]
