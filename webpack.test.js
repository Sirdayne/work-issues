const path = require("path")
const webpack = require("webpack")
const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const CleanWebpackPlugin = require("clean-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const UglifyJsPlugin = require("uglifyjs-webpack-plugin")
const CompressionPlugin = require("compression-webpack-plugin")

module.exports = merge(common, {
  mode: "production",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "static/js/[name].[chunkhash].js",
    pathinfo: true,
  },
  module: {
    rules: [{
      test: /\.vue$/,
      loader: "vue-loader",
    },
    {
      test: /\.css$/,
      use: [
        MiniCssExtractPlugin.loader,
        {
          loader: "css-loader",
          options: {
            sourceMap: false,
          }
        },
        {
          loader: "postcss-loader",
          options: {
            sourceMap: false,
          }
        },
      ],
    },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      "IS_PROD": JSON.stringify(false),
      "SERVER_URL": JSON.stringify("http://agroplanapi-test.azurewebsites.net/"),
    }),
    new CleanWebpackPlugin(["dist"]),
    new MiniCssExtractPlugin({
      filename: "static/css/[name].[contenthash].css",
    }),
    new CompressionPlugin()
  ],
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
      })
    ],
    splitChunks: {
      cacheGroups: {
        styles: {
          name: "styles",
          test: /\.css$/,
          chunks: "all",
          enforce: true
        }
      }
    },
  },
});
