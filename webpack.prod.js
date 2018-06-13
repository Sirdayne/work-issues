const webpack = require('webpack')
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = merge(common, {
  mode: 'production',
  module: {
    rules: [{
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: false,
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: false,
            }
          },
        ],
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
      "IS_PROD": JSON.stringify(true),
      "SERVER_URL": JSON.stringify("http://agroplanapi.azurewebsites.net/"),
    }),
    new CleanWebpackPlugin(['dist']),
    new UglifyJsPlugin(),
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].css?[contenthash]',
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: false,
        uglifyOptions:{
          compress: {
            warnings: false
          },
          output: {
            comments: false,
            beautify: false,
          },
        },
      }),
    ],
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        }
      }
    },
  },
});
