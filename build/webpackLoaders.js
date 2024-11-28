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
    test: /\.vue(\?[^?]+)?$/,
    use: '@dolphinweex/weex-loader',
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
