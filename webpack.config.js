const path = require('path')

module.exports = {
  entry: path.resolve(__dirname, 'src', 'index.js'),
  output: {
    path: BUILD_DIR,
    publicPath: '/',
    filename: 'bundle.js',
  }
}