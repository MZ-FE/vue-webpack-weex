module.exports = [
  {
    test: /\.js$/,
    use: ['babel-loader'],
  },
  {
    test: /\.css$/,
    use: ['style-loader', 'css-loader'],
  },
  {
    test: /\.scss$/,
    use: ['style-loader', 'css-loader', 'sass-loader'],
  },
  {
    test: /\.less$/,
    use: ['style-loader', 'css-loader', 'less-loader'],
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
]
