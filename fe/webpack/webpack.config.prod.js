const path = require('path');
const webpack = require('webpack');
const manifest = require('./../package.json');

// webpack plugins
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');

const CompressionPlugin = require('compression-webpack-plugin');

// node environment
const environment = process.env.NODE_ENV || 'production';

// dependencies
const dependencies = Object.keys(manifest.dependencies).filter((dependency) => (
  dependency !== 'babel-runtime' && dependency !== 'font-awesome' && dependency !== 'express'
));

module.exports = {
  // main entry file for the application
  entry: {
    main: `./src/index.js`,
    vendor: dependencies,
  },

  // output
  output: {
    path: path.join(__dirname, './../build'),
    filename: '[name].bundle.js',
    sourceMapFilename: '[name].bundle.map'
  },

  devtool: 'inline-source-map',

  plugins: [

    new webpack.DefinePlugin({
      'process.env.VERSION': JSON.stringify(manifest.version),
    }),

    new webpack.ProvidePlugin({
      'fetch': 'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch',
      'URLSearchParams': 'url-search-params',
    }),

    // clean up the dist folder
    new CleanWebpackPlugin(['build'], {
      root: path.resolve(__dirname, '../'),
      exclude: [],
      verbose: true,
      dry: false,
    }),

    // define constants
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(environment),
    }),

    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks: function (module) {
        return module.context && module.context.indexOf("node_modules") !== -1;
      }
    }),

    // // extract common
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'common',
    //   filename: 'common.js',
    //   minChunks: Infinity,
    // }),

    // uglify the javascript
    new ParallelUglifyPlugin({}),

    // generate the index.html
    new HtmlWebpackPlugin({
      chunks: ['vendor', 'main'],
      filename: 'index.html',
      minify: {
        collapseWhitespace: true,
        preserveLineBreaks: false,
      },
      inject: false,
      template: './src/index.prod.ejs',
      title: 'Work Cycle',
      hash: true,
    }),

    // extract css bundle
    new ExtractTextPlugin(`[name]_${manifest.version}.css`),

    //       new webpack.LoaderOptionsPlugin({
    //         minimize: true,
    //         debug: false
    //       }),

    // prints more readable module names in the browser console on HMR updates
    new webpack.NamedModulesPlugin(),

    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$|\.eot?.+$|\.ttf?.+$|\.woff?.+$|\.svg?.+$/,
      threshold: 10240,
      minRatio: 0.8
    }),

    // copy locales and mocks
    new CopyWebpackPlugin([
      {
        from: `./src/l10n`,
        to: `l10n`
      },
      {
        from: `./src/assets`,
        to: `assets`,
        ignore: ['*.scss', '*.sass', '*.less'],
      },
      {
        from: `./src/mocks`,
        to: `mocks`,
      },
    ], {
      copyUnmodified: true
    }),

  ],

  // run eslint-loader when the *.js files are changed
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: [
          'react-hot-loader/webpack',
          'babel-loader',
          'eslint-loader',
        ]
      },
      {
        test: /\.sass|scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
            },
            {
              loader: 'sass-loader',
              options: {
                outputStyle: 'expanded',
              },
            },
          ],
        })
      },
      {
        test: /\.jpg$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'image/jpg',
          },
        },
      },
      {
        test: /\.png$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'image/png',
          },
        },
      },
      // {
      //   test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      //   use: {
      //     loader: 'url-loader',
      //     options: {
      //       limit: 10000,
      //       mimetype: 'image/svg+xml',
      //     },
      //   },
      // },
      {
         test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
         use: [{
           loader: 'file-loader',
           options: {
             name: '[name].[ext]',
             outputPath: 'fonts/',    // where the fonts will go
             publicPath: '../'       // override the default path
           }
         }]
       },
    ]
  }
};
