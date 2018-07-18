
module.exports = {
    entry: './src/Server.ts',
    target: 'node',
    output: {
        filename: './dist/ServerApi.js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss']
    },
    module: {
        rules: [
            {test: /\.tsx?$/, loader: 'ts-loader'},
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
	// ,
	// plugins: [
		// new CompressionPlugin({   <-- Add this
			// asset: "[path].gz[query]",
			// algorithm: "gzip",
			// test: /\.js$|\.css$|\.html$/,
			// threshold: 10240,
			// minRatio: 0.8
		// })
	// ]
};