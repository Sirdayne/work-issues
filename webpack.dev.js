const webpack = require('webpack')
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  devtool: '#eval-source-map',
  module: {
    rules: [{
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          esModule: true,
        }
      },
      {
        test: /\.css$/,
        use: [
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
    historyApiFallback: true,
    compress: true,
    stats: {
      warnings: true,
    },
    hot: true
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"',
        PROD: 'false',
        API_URL: '"http://agroplanapi-test.azurewebsites.net/"',
      }
    }),
    new webpack.HotModuleReplacementPlugin(),
  ]
});
