const path = require('path')
const { merge } = require('webpack-merge')
const TerserPlugin = require('terser-webpack-plugin')
const env = require('dotenv').config().parsed
const entry = require('./build/makeEntryFile')
const rules = require('./build/webpackLoaders')
const plugins = require('./build/webpackPlugins')
const pushToEnds = require('./build/push')
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin

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
    plugins: [
      ...plugins,
      // 打包完成是否执行一次adb推送
      {
        apply: compiler => {
          compiler.hooks.done.tap('AutoPush', () => {
            console.log('Compiled successfully') // 必须增加，IDE通过检测该日志输出判断插件是否编译完成，进而唤醒手机进入调试模式，可在任意其他compiler.hooks.done的监听事件中增加该日志
            if (!env.PUSH_AFTER_DONE) {
              return
            }
            pushToEnds()
          })
        },
      },
    ],
    resolve: {
      extensions: ['.js', '.vue'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        src: path.resolve(__dirname, 'src'),
        js: path.resolve(__dirname, 'src/js'),
        views: path.resolve(__dirname, 'src/views'),
        assets: path.resolve(__dirname, 'src/assets'),
      },
    },
    stats: {
      warnings: false,
      modules: false,
    },
  }
  if (argv.mode === 'development') {
    return merge(commonConfig, {
      mode: 'development',
      watchOptions: {
        ignored: /package.json/,
      },
      devtool: 'inline-source-map', // 重要！重要！重要！修改inline-source-map或者source-map，仅调试模式增加，该设置会大幅增加打包后代码的体积
      plugins: [
        // 打包大小可视化分析
        new BundleAnalyzerPlugin({
          analyzerMode:
            env.DEV_BUNDULE_ANALYZE === 'true' ? 'server' : 'disabled',
        }),
      ],
    })
  }
  return merge(commonConfig, {
    mode: 'production',
    plugins: [
      new BundleAnalyzerPlugin({
        analyzerMode: argv.analyze ? 'static' : 'disabled',
        generateStatsFile: !!argv.analyze,
      }),
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
