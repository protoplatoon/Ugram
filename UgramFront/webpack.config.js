const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CompressionPlugin = require("compression-webpack-plugin")
var path = require('path');
var fs = require('fs');
const webpack = require('webpack');

var nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

//console.log('Node Modules: '+ JSON.stringify(nodeModules));

module.exports = {
    entry: './src/Index.tsx',
    output: {
        filename: './dist/js/bundle.js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss']
    },
    module: {
        rules: [
            {test: /\.tsx?$/, loader: ['ts-loader']},
            {test: /\.(css|scss)$/,
                use: [{
                    loader: 'style-loader'
                }, {
                    loader: 'css-loader', options: {
                        sourceMap: true
                    }
                }, {
                    loader: 'sass-loader', options: {
                        sourceMap: true
                    }
                }]
            }
        ]
    }
    // uncomment for deployement
	,
	plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
         }),
         new webpack.optimize.ModuleConcatenationPlugin(),
         new UglifyJsPlugin({
             include: /\.js$/
           }),
	 	new CompressionPlugin({   // <-- Add this
	 		asset: "[path].gz[query]",
	 		algorithm: "gzip",
	 		test: /\.js$|\.css$|\.html$/,
	 		threshold: 10240,
	 		minRatio: 0.8
         })
	 ]
};