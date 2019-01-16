const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: { 'main': './ClientApp/app.js' },
  output: {
    path: path.resolve(__dirname, 'wwwroot/dist'),
    filename: 'bundle.js',
//    publicPath: '/'
  },
//  watch: true,
  resolve: { extensions: [ '.js' ] },
  devServer: {
    contentBase: path.join(__dirname, 'wwwroot/dist'),
    index: 'index.html',
    hot: true
  },
  module: {
    rules: [ 
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.ttf$/,
        use: [{
            loader: 'file-loader',
            options: {
                name: '[name].[ext]',
                outputPath: 'fonts/'
            }
        }]
      },
      {
        test: /\.png$/,
        use: 'file-loader'
      }
    ]
  },
  plugins: [
//    new CleanWebpackPlugin('./wwwroot/dist'),
    new HtmlWebpackPlugin({
      hash: true,
      template: './ClientApp/index.html',
      filename: 'index.html'
    }),
    new CopyWebpackPlugin([
      {
        from: './ClientApp/lib/phaser-plugin-isometric.js',
      //  to: 'dist/',
        flatten: true
      }
    ])
  ]
};