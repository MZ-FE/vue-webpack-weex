const path = require('path')
const { merge } = require('webpack-merge')
const TerserPlugin = require('terser-webpack-plugin')
const env = require('dotenv').config().parsed
const entry = require('./build/makeEntryFile')
const rules = require('./build/webpackLoaders')
const plugins = require('./build/webpackPlugins')

module.exports = (_, argv) => {
  const commonConfig = {
    entry,
    output: {
      filename: '[name].js',
      path:
        env.NON_STANDARD_DEVICE === 'false'
          ? path.resolve(__dirname, 'dist', env.DEVICE_INFO)
          : path.resolve(__dirname, 'dist'),
    },
    module: {
      rules,
    },
    plugins,
    resolve: {
      extensions: ['.js', '.vue'],
      alias: {
        '@': path.resolve(__dirname, 'src'), // 这样配置后 @ 可以指向 src 目录
        src: path.resolve(__dirname, 'src'),
        js: path.resolve(__dirname, 'src/js'),
        views: path.resolve(__dirname, 'src/views'),
        assets: path.resolve(__dirname, 'src/assets'),
      },
    },
  }
  if (argv.mode === 'development') {
    return merge(commonConfig, { mode: 'development' })
  }
  return merge(commonConfig, {
    mode: 'production',
    plugins: [
      // 打包完成后退出，可以继续执行后续的的脚本
      {
        apply: compiler => {
          compiler.hooks.done.tap('exit', () => {
            setTimeout(() => {
              process.exit(0)
            })
          })
        },
      },
    ],
    optimization: {
      usedExports: true,
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            output: {
              comments: /{ "framework": "Vue" }/,
            },
          },
          extractComments: false,
        }),
      ],
    },
  })
}
