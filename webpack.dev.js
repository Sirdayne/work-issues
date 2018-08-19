const path = require("path")
const webpack = require("webpack")
const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = merge(common, {
  mode: "development",
  devtool: "eval",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "static/js/[name].js?[hash]",
    pathinfo: true,
  },
  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: "pug-lint-loader",
        options: require(path.resolve(__dirname, "./.pug-lintrc.js")),
        include: [path.resolve(__dirname, "./src")],
        exclude: file => (
          /_models/.test(file)
        ),
      },
      {
        enforce: "pre",
        test: /\.(js|vue)$/,
        loader: "eslint-loader",
        include: [path.resolve(__dirname, "./src")],
        exclude: file => (
          /_models/.test(file)
        ),
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "vue-style-loader",
          },
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
          {
            loader: "postcss-loader",
            options: {
              sourceMap: true,
            }
          },
        ],
      },
    ]
  },
  devServer: {
    inline: true,
    hot: true,
    host: "localhost",
    port: 8080,
    compress: true,
    clientLogLevel: "warning",
  },
  plugins: [
    new webpack.DefinePlugin({
      IS_PROD: JSON.stringify(false),
      SERVER_URL: JSON.stringify("http://agroplanapi-test.azurewebsites.net/"),
    }),
    new webpack.HotModuleReplacementPlugin(),
    new BundleAnalyzerPlugin({openAnalyzer: false}),
  ]
});
