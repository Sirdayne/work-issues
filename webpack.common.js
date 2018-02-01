const path = require('path')
const webpack = require('webpack')
const DirectoryNamedWebpackPlugin = require("directory-named-webpack-plugin")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackAutoInject = require('webpack-auto-inject-version');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: "static/js/[name].[hash].js",
    pathinfo: true,
  },
  module: {
    rules: [{
        test: /\.js$/,
        loader: 'babel-loader',
        include: [path.resolve(__dirname, "./src")],
        exclude: [path.resolve(__dirname, "./node_modules")],
      },
      {
        test: /\.ya?ml$/,
        loader: 'yml-loader'
      },
      {
        test: /\.styl$/,
        use: [{
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
          {
            loader: 'stylus-loader',
          },
        ],
      },
      {
        test: /_models\/*/,
        use: ['models-loader'],
      },
    ]
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    modules: [path.resolve(__dirname, "./src"), "node_modules"],
    mainFields: ["browser", "module", "main"],
    plugins: [new DirectoryNamedWebpackPlugin()],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      'assets': path.resolve(__dirname, './src/assets'),
    }
  },
  resolveLoader: {
    alias: {
      'models-loader': path.resolve(__dirname, './src/lib/modelsLoader'),
    },
  },
  plugins: [
    new webpack.HashedModuleIdsPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true,
      title: 'AgroStream',
      favicon: 'favicon.ico',
      chunksSortMode: 'dependency',
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks: function (module) {
        return module.context && module.context.indexOf("node_modules") !== -1;
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: "manifest",
      minChunks: Infinity
    }),
    new WebpackAutoInject({
      SILENT: true,
      components: {
        AutoIncreaseVersion: true,
        InjectAsComment: false,
        InjectByTag: true
      },
    })
  ],
  node: {
    fs: "empty",
    net: "empty",
  }
}
