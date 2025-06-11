const path = require('path')

module.exports = {
  entry: {
    indoorgraphs: path.resolve(__dirname, 'src/index.ts')
  },
  output: {
    publicPath: '',
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2'
  },
  resolve: { extensions: ['.ts', '.tsx', '.js'] },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        loader: 'ts-loader'
      }
    ]
  }
}
