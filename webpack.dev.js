const webpack = require('webpack')
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval',
  module: {
    rules: [{
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'vue-style-loader',
          },
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
            }
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        loader: 'url-loader?limit=8192&name=static/img/[name].[ext]?[hash]',
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/,
        loader: 'url-loader?limit=8192&name=static/fonts/[name].[ext]?[hash]',
      },
    ]
  },
  devServer: {
    inline: true,
    hot: true,
    host: 'localhost',
    port: 8080,
    compress: true,
    clientLogLevel: "warning",
  },
  plugins: [
    new webpack.DefinePlugin({
      IS_PROD: JSON.stringify(false),
      SERVER_URL: JSON.stringify("http://agroplanapi-test.azurewebsites.net/"),
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ]
});
