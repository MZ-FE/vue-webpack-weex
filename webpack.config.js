const path = require('path')
const { merge } = require('webpack-merge')
const TerserPlugin = require('terser-webpack-plugin')
const env = require('dotenv').config().parsed
const entry = require('./build/makeEntryFile')
const rules = require('./build/webpackLoaders')
const plugins = require('./build/webpackPlugins')
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
