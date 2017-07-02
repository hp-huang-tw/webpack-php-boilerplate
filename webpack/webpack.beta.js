const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const outputDir = '../dist'
const publicPath = "https://www.google-beta.com"
const templatePath = "/var/www/template/"

const pageConfig = require('./page.config.js').map(config => {
    return new HtmlWebpackPlugin(config)
})

const extractSass = new ExtractTextPlugin({
    filename: "static/[name].css",
});

const htmlReplace = new HtmlReplaceWebpackPlugin([{
        pattern: /<!--###(.+)###-->/gi,
        replacement: "$1"
    },
    {
        pattern: /<!-- html:test-code-start -->(.|[\r|\n])*?<!-- html:test-code-end -->/gi,
        replacement: ""
    },
    {
        pattern: /<!--image:publicPath->/gi,
        replacement: publicPath
    },
    {
        pattern: /<!--template:publicPath->/gi,
        replacement: templatePath
    }
])

const optimizeCss = new OptimizeCssAssetsPlugin({
    assetNameRegExp: /\.css$/,
    cssProcessorOptions: {
        discardComments: {
            removeAll: true
        }
    }
})

module.exports = {
    devtool: 'cheap-module-source-map',
    entry: {
        app: 'src/js/runApplication.js'
    },
    output: {
        filename: 'static/[name].js',
        path: path.resolve(__dirname, outputDir),
        publicPath: publicPath
    },
    module: {
        rules: [{
                test: /\.scss$/,
                use: extractSass.extract({
                    use: [
                        'css-loader?-url',
                        {
                            loader: 'sass-loader',
                            options: {
                                includePaths: [
                                    path.resolve(__dirname, "../node_modules/compass-mixins/lib")
                                ]
                            }
                        }
                    ],
                    fallback: 'style-loader'
                })
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|otf)$/,
                loader: 'file?name=src/fonts/[name].[ext]'
            }
        ]
    },
    resolve: {
        extensions: ['.js'],
        alias: {
            'src': path.resolve(__dirname, '../src/'),
        }
    },
    plugins: [
        htmlReplace,
        extractSass,
        new uglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        optimizeCss
    ].concat(pageConfig)
};