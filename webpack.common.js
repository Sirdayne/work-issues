const path = require('path')
const webpack = require('webpack')
const DirectoryNamedWebpackPlugin = require("directory-named-webpack-plugin")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackAutoInject = require('webpack-auto-inject-version');
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: "static/js/[name].js?[hash]",
    pathinfo: true,
  },
  module: {
    rules: [{
        test: /\.js$/,
        loader: 'babel-loader',
        include: [path.resolve(__dirname, "./src")],
        exclude: file => (
          /node_modules/.test(file) && !/\.vue\.js/.test(file)
        ),
      },
      {
        test: /\.pug$/,
        loader: 'pug-plain-loader'
      },
      {
        test: /\.ya?ml$/,
        loader: 'yml-loader'
      },
      {
        test: /\.styl(us)?$/,
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
          {
            loader: 'stylus-loader',
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'vue-style-loader',
          },
          {
            loader: "style-loader" // creates style nodes from JS strings
          },
          {
            loader: "css-loader" // translates CSS into CommonJS
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
            }
          },
          {
            loader: "sass-loader" // compiles Sass to CSS
          },
        ]
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
    new WebpackAutoInject({
      SILENT: true,
      components: {
        AutoIncreaseVersion: true,
        InjectAsComment: false,
        InjectByTag: true
      },
    }),
    new VueLoaderPlugin(),
  ],
  optimization: {
    runtimeChunk: {
      name: entrypoint => `runtimechunk~${entrypoint.name}`
    },
  },
}
