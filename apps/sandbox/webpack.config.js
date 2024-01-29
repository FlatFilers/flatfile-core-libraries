const nodeExternals = require('webpack-node-externals')
const path = require('path')
const { ESBuildMinifyPlugin } = require('esbuild-loader')

module.exports = {
  mode: 'production',
  entry: './src/xdk-simple-deploy.ts',
  externalsPresets: { node: true },
  output: {
    filename: 'build.js',
    library: {
      export: 'default',
      name: 'sdk',
      type: 'umd', // Important
    },
    path: path.resolve(__dirname, '.flatfile'),
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  optimization: {
    // ...
    minimizer: [
      new ESBuildMinifyPlugin({
        keepNames: true,
      }),
      // ...
    ],
  },
}
