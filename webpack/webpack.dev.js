const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

const ip = require('ip')
const ipAddress = ip.address()

const outputDir = '../dist'
const publicPath = 'http://' + ipAddress + ':3000/index'
const templatePath = "./"

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
        replacement: 'http://' + ipAddress + ':3000/dist/'
    },
    {
        pattern: /<!--template:publicPath->/gi,
        replacement: templatePath
    }
])

module.exports = {
    devtool: 'cheap-module-source-map',
    devServer: {
        port: 3000,
        host: ipAddress,
        historyApiFallback: true,
        noInfo: false,
        stats: 'minimal',
        proxy: {
            '/index': {
                changeOrigin: true,
                target: 'http://' + ipAddress + ':3000/dist/template/index.html',
                pathRewrite: {
                    '/index': ''
                }
            }
        },
        headers: { "Access-Control-Allow-Origin": "*" }
    },
    entry: {
        app: 'src/js/runApplication.js'
    },
    output: {
        filename: 'static/[name].js',
        path: path.resolve(__dirname, outputDir),
        sourceMapFilename: 'static/[name].map',
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
        extractSass
    ].concat(pageConfig)
};