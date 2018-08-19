const path = require("path")
const webpack = require("webpack")
const DirectoryNamedWebpackPlugin = require("directory-named-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const InlineManifestWebpackPlugin = require("inline-manifest-webpack-plugin")
const WebpackAutoInject = require("webpack-auto-inject-version");
const VueLoaderPlugin = require("vue-loader/lib/plugin")

module.exports = {
  entry: "./src/main.js",
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        include: [path.resolve(__dirname, "./src")],
      },
      {
        test: /\.pug$/,
        loader: "pug-plain-loader"
      },
      {
        test: /\.ya?ml$/,
        loader: "yml-loader"
      },
      {
        test: /\.styl(us)?$/,
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
          {
            loader: "stylus-loader",
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: "vue-style-loader",
          },
          {
            loader: "style-loader" // creates style nodes from JS strings
          },
          {
            loader: "css-loader" // translates CSS into CommonJS
          },
          {
            loader: "postcss-loader",
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
        use: ["models-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        loader: "url-loader?limit=8192&name=static/img/[name].[hash].[ext]",
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/,
        loader: "url-loader?limit=8192&name=static/fonts/[name].[hash].[ext]",
      },
    ]
  },
  resolve: {
    extensions: [".js", ".vue", ".json"],
    modules: [path.resolve(__dirname, "./src"), "node_modules"],
    mainFields: ["browser", "module", "main"],
    plugins: [new DirectoryNamedWebpackPlugin()],
    alias: {
      "vue$": "vue/dist/vue.esm.js",
      "assets": path.resolve(__dirname, "./src/assets"),
    }
  },
  resolveLoader: {
    alias: {
      "models-loader": path.resolve(__dirname, "./src/lib/modelsLoader"),
    },
  },
  plugins: [
    new webpack.HashedModuleIdsPlugin(),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "index.html",
      inject: true,
      title: "AgroStream",
      favicon: "favicon.ico",
      chunksSortMode: "dependency",
    }),
    new InlineManifestWebpackPlugin(),
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
    splitChunks: {
      cacheGroups: {
        vue: {
          test: /[\\/]node_modules[\\/](vue|vuex|vue-router)[\\/]/,
          name: "vue",
          chunks: "all",
          priority: 2,
          reuseExistingChunk: true,
          minSize: 0,
          minChunks: 1,
        },
        eleme: {
          test: /[\\/]node_modules[\\/](element-ui)[\\/]/,
          name: "eleme",
          chunks: "initial",
          priority: 3,
          reuseExistingChunk: true,
          minSize: 0,
          minChunks: 1,
        },
        leaflet: {
          test: /[\\/]node_modules[\\/](leaflet)[\\/]/,
          name: "leaflet",
          chunks: "async",
          priority: 1,
          reuseExistingChunk: true,
          minSize: 0,
          minChunks: 1,
        },
        jquery: {
          test: /[\\/]node_modules[\\/](jquery)[\\/]/,
          name: "jquery",
          chunks: "async",
          priority: 1,
          reuseExistingChunk: true,
          minSize: 0,
          minChunks: 1,
        },
        vendor: {
          test (module) {
            return !/[\\/]node_modules[\\/](vue|vuex|vue-router|element-ui|leaflet|jquery)[\\/]/.test(module.context) && /[\\/]node_modules[\\/]/.test(module.context);
          },
          name: "vendor",
          chunks: "initial",
          priority: 4,
          reuseExistingChunk: true,
          minSize: 0,
          minChunks: 1,
        },
      }
    },
    runtimeChunk: "single",
  },
}
