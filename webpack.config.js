const path = require('path')
const { merge } = require('webpack-merge')
const TerserPlugin = require('terser-webpack-plugin')

const entry = require('./build/makeEntryFile')
const rules = require('./build/webpackLoaders')
const plugins = require('./build/webpackPlugins')

module.exports = (env, argv) => {
  const commonConfig = {
    entry,
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
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
