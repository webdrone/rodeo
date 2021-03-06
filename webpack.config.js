const pkg = require('./package.json'),
  path = require('path'),
  webpack = require('webpack'),
  CompressionPlugin = require('compression-webpack-plugin');

module.exports = [{
  cache: false,
  context: path.join(__dirname, 'src'),
  devtool: 'source-map',
  entry: {
    startup: [
      './browser/entry/startup'
    ],
    main: [
      './browser/entry/main'
    ],
    'free-tabs-only': [
      './browser/entry/free-tabs-only'
    ]
  },
  externals: {
    'ascii-table': 'AsciiTable',
    jquery: 'jQuery',
    ace: 'ace',
    ipc: 'ipc'
  },
  module: {
    loaders: [
      { test: /\.json/, loader: 'json' },
      { test: /\.less$/, loader: 'style!css!less' },
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.(png|gif)$/, loader: 'url?name=[name].[hash].[ext]&limit=8192&&outputPath=app' }, // inline base64 URLs for <=8k images, direct URLs for the rest
      { test: /\.svg$/, loaders: ['file?name=[name].[hash].[ext]', 'svgo?useConfig=svgoConfig1&outputPath=app'] },
      { test: /\.(md|py)$/, loader: 'raw' }, // because we sometimes treat it differently based on the context (i.e., code)
      { test: /\.ya?ml$/, loader: 'json!yaml' }, // some things we want to change often, so it goes in config files
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        cacheDirectory: true,
        query: {
          plugins: [
            'lodash',
            'transform-runtime',
            'transform-react-remove-prop-types',
            'transform-react-constant-elements',
            'transform-react-inline-elements'
          ],
          presets: ['react', 'es2015']
        }
      },
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, 'node_modules/rulejs')
        ],
        loader: 'babel',
        cacheDirectory: true,
        query: {
          plugins: ['lodash'],
          presets: ['es2015']
        }
      }
    ]
  },
  node: {
    __filename: true,
    __dirname: true
  },
  plugins: [
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      __APP_NAME__: JSON.stringify(pkg.name),
      __VERSION__: JSON.stringify(pkg.version)
    }),
    new webpack.optimize.UglifyJsPlugin ({
      beautify: false,
      comments: false,
      compress: {
        sequences: true,
        booleans: true,
        loops: true,
        unused: true,
        warnings: false,
        // drop_console: true,
        unsafe: true
      },
      test: /\.(js|jsx)$/
    }),
    new CompressionPlugin ({
      asset: '[path].gz [query]',
      algorithm: 'gzip',
      test: /\.js$|\.html$/,
      threshold: 10240,
      minRatio: 0.8
    })
  ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'app')
  },
  stats: {
    colors: true
  },
  svgoConfig1: {
    plugins: [
      {removeTitle: true},
      {convertColors: {shorthex: false}},
      {convertPathData: false}
    ]
  },
  target: 'electron-renderer'
}];
