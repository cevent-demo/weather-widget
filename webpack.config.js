var webpack = require('webpack');
module.exports = {
    entry: [
      'webpack/hot/dev-server',
      './js/app.js'
    ],
    output: {
        path: __dirname + '/build',
        filename: 'bundle.js'
    },
    module: {
        loaders: [
          { test: /\.js$/, loaders: ['react-hot', 'jsx-loader?insertPragma=React.DOM&harmony'], exclude: /node_modules/ },
          { test: /\.css$/, loader: 'style-loader!css-loader' }
        ]
    },
    plugins: [
      new webpack.NoErrorsPlugin()
    ]

};
