const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const validate = require('webpack-validator');

const config = {
  entry: {
    app: path.join(__dirname, 'app', 'initialize.js')
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js'
  },
  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    //stats: 'errors-only',
  },
  watchOptions: {
    // Delay the rebuild after the first change
    aggregateTimeout: 300,
    // Poll using interval (in ms, accepts boolean too)
    poll: 1000
  },
  devtool: 'eval-source-map',
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: ['style', 'css'],
        include: path.join(__dirname, 'app')
      },
      {
        test: /\.scss$/,
        loaders: ['style', 'css', 'postcss', 'sass']
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react'],
          plugins: ['syntax-object-rest-spread']
        }
      },
      {
        test: /\.(png)$/,
        loader: 'file-loader'
      }
    ]
  },
  resolve: {
    root: [
      path.join(__dirname, 'app')
    ],
    modulesDirectories: [
      'node_modules'
    ],
    extensions: ['', '.js', '.jsx']
  },
  plugins: [
    new HtmlWebpackPlugin({title: 'Pabla'}),
    new webpack.HotModuleReplacementPlugin({multiStep: true}),
    new webpack.optimize.UglifyJsPlugin({
      compress: {warnings: false}
    })
  ],
  postcss: function() {
    return [require('autoprefixer')];
  }
};

module.exports = validate(config);
