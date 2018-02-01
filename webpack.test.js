const webpack = require('webpack')
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = merge(common, {
  devtool: '#source-map',
  module: {
    rules: [{
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          esModule: true,
          extractCSS: true,
          cssSourceMap: false,
        }
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [{
              loader: 'css-loader',
              options: {
                sourceMap: false
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: false
              }
            },
          ],
        })
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        loader: 'url-loader?limit=8192&name=/static/img/[name].[ext]?[hash]',
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/,
        loader: 'url-loader?limit=8192&name=/static/fonts/[name].[ext]?[hash]',
      },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
        PROD: 'false',
        API_URL: '"http://agroplanapi-test.azurewebsites.net/"',
      }
    }),
    new CleanWebpackPlugin(['dist']),
    new ExtractTextPlugin({
      filename: 'static/css/[name].[contenthash].css',
      allChunks: true
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
      output: {
        comments: false,
        beautify: false,
      },
    }),
  ]
});
