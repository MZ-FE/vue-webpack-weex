const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const { merge } = require('webpack-merge')
const TerserPlugin = require('terser-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const category_name = process.env.CATE_NAME || 'demo'
const entry = {}
function getEntryFile(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullpath = path.join(dir, file)
    const stat = fs.statSync(fullpath)
    const extname = path.extname(fullpath)

    if (stat.isFile() && extname === '.js') {
      const name = path.basename(file, extname)
      entry[name] = fullpath
    }
  })
}
const entryFolderPath = path.resolve(
  __dirname,
  `./src/widgets/${category_name}/entry`
)
// 遍历src/entry文件夹下的一级js文件做打包入口，即entry/*.js
getEntryFile(entryFolderPath)

const widgetVersion = (function () {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = `${currentDate.getMonth() + 1}`.padStart(2, 0)
  const currentDay = `${currentDate.getDate()}`.padStart(2, 0)
  const currentHour = `${currentDate.getHours()}`.padStart(2, 0)
  const currentMinute = `${currentDate.getMinutes()}`.padStart(2, 0)

  const majorVersion = `${currentYear}`
  const secondVersion = `${currentMonth}${currentDay}`
  const revisionNumber = `${currentHour}${currentMinute}`
  return `${majorVersion}.${secondVersion}.${revisionNumber}`
})()

const commonConfig = merge([
  {
    entry,
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: ['babel-loader'],
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: 'css-loader',
            },
          ],
        },
        {
          test: /\.vue(\?[^?]+)?$/,
          use: 'weex-loader',
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[hash].[ext]',
                outputPath: 'assets',
                publicPath: './assets',
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        WIDGET_VERSION: JSON.stringify(widgetVersion),
      }),
      new CleanWebpackPlugin(),
      new webpack.BannerPlugin({
        banner: '// { "framework": "Vue" }\n',
        raw: true,
      }),
    ],
    resolve: {
      extensions: ['.js', '.vue'],
      alias: {
        '@': path.resolve(__dirname, 'src'), // 这样配置后 @ 可以指向 src 目录
        src: path.resolve(__dirname, 'src'),
        css: path.resolve(__dirname, 'src/css'),
        js: path.resolve(__dirname, 'src/js'),
        widget: path.resolve(__dirname, `src/widgets/${category_name}`),
        views: path.resolve(__dirname, `src/widgets/${category_name}/views`),
        assets: path.resolve(__dirname, `src/widgets/${category_name}/assets`),
      },
    },
  },
])

const developmentConfig = merge([])

const productionConfig = merge([
  {
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
  },
])

module.exports = mode => {
  if (mode.development === true) {
    return merge(commonConfig, productionConfig, { mode: 'development' })
  }
  return merge(commonConfig, developmentConfig, { mode: 'production' })
}
