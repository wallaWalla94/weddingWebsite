const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'img', to: 'img' },
        { from: 'css', to: 'css' },
        { from: 'stylesChinese.css', to: 'stylesChinese.css' },
        { from: 'js/scriptWedding.js', to: 'js/scriptWedding.js' },
        { from: 'js/admin.js', to: 'js/admin.js' },
        { from: 'js/supabaseWeddingConfig.js', to: 'js/supabaseWeddingConfig.js' },
        { from: 'js/vendor', to: 'js/vendor' },
        { from: 'gc-admin-portal-9xA82.html', to: 'gc-admin-portal-9xA82.html' },
        { from: 'icon.svg', to: 'icon.svg' },
        { from: 'favicon.ico', to: 'favicon.ico' },
        { from: 'robots.txt', to: 'robots.txt' },
        { from: 'favicon.png', to: 'favicon.png' },
        { from: '404.html', to: '404.html' },
        { from: 'site.webmanifest', to: 'site.webmanifest' },
      ],
    }),
  ],
});
