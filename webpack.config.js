/* global __dirname, require, module */

const webpack = require('webpack')
// const package = require('./package.json')
const path = require('path')

const config = {
  // stop if there are any errors
  bail: true,
  // devtool: 'source-map',
  entry: {
    'bfx-server-lib': path.join(__dirname, 'src/index.js'),
    // functions
    express: path.join(__dirname, 'src/express/index.js'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: [ 'bfx-lib-server-js', '[name]' ]
  },
  externals: {
    'lodash': 'lodash',
    'fs': 'fs',
  },
  module: {
    rules: [
      {
        test: /(\.jsx|\.js)$/,
        use: 'babel-loader'
      }
    ]
  },
  plugins: [
    // sets up NODE_ENV
    // new webpack.optimize.CommonsChunkPlugin(
    //   { name: 'vendor', filename: 'vendor.bundle.js' }
    // ),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    })
  ]
}

module.exports = function (env) {
  console.log('Env:', env)

  // enablescompression-webpack-plugin bundle gzipping
  // if (env === 'build') {
    // file compression
    // var CompressionPlugin = require('compression-webpack-plugin')
    // config.plugins.push(
    //   new CompressionPlugin({
    //     asset: '[path].gz[query]',
    //     algorithm: 'gzip',
    //     test: /\.(js|html)$/,
    //     threshold: 10240,
    //     minRatio: 0.8
    //   })
    // )

    // js minification
    // config.plugins.push(
    //   new webpack.optimize.UglifyJsPlugin({
    //     compress: {
    //       screw_ie8: true,
    //       warnings: false
    //     },
    //     mangle: {
    //       screw_ie8: true
    //     },
    //     output: {
    //       comments: false,
    //       screw_ie8: true
    //     }
    //   })
    // )
  // }

  return config
}
