"use strict";

const webpack = require("webpack"),
	path = require("path");

module.exports = (config) => {
	const srcDir = path.resolve(__dirname, "./src");

	const configuration = {
		basePath: "",

		frameworks: ["jasmine"],

		plugins: [
			"karma-chrome-launcher",
			"karma-coverage",
			"karma-coverage-istanbul-reporter",
			"karma-electron",
			"karma-jasmine",
			"karma-sourcemap-loader",
			"karma-spec-reporter",
			"karma-webpack"
		],

		files: [{
			pattern: "./test/karma.entry.js",
			watched: false
		}, {
			pattern: "./+(src|test)/**/*.ts",
			watched: true,
			included: false,
			served: false,
			nocache: true
		}],

		preprocessors: {
			"./test/karma.entry.js": [
				"coverage",
				"webpack",
				"sourcemap"
			]
		},

		webpack: {
			resolve: {
				extensions: [".ts", ".js"],
				alias: {
					"@lchemy/ng-forms": srcDir
				}
			},
			module: {
				rules: [{
					test: /\.ts/,
					loaders: [{
						loader: "ts-loader",
						options: {
							compilerOptions: {
								target: "es5",
								module: "commonjs"
							}
						}
					}],
					exclude: [
						/node_modules/
					]
				}, {
					test: /\.ts$/,
					use: [{
						loader: "istanbul-instrumenter-loader"
					}],
					enforce: "post",
					include: [
						/src[\/\\]/
					],
					exclude: [
						/test[\/\\]/,
						/node_modules/
					]
				}]
			},
			plugins: [
				// See: https://github.com/angular/angular/issues/11580
				new webpack.ContextReplacementPlugin(
					/angular(\\|\/)core(\\|\/)@angular/,
					srcDir
				)
			],
			performance: {
				hints: false
			}
		},

		webpackMiddleware: {
			stats: "errors-only"
		},

		coverageIstanbulReporter: {
			reports: ["text", "text-summary", "html"],
			dir: "./coverage",
			fixWebpackSourcePaths: true
		},

		reporters: [
			"spec",
			"coverage-istanbul"
		],

		port: 9876,
		colors: true,
		logLevel: config.LOG_INFO,

		autoWatch: true,
		autoWatchBatchDelay: 1000,

		singleRun: true,

		browsers: ["Chrome"],

		specReporter: {
			maxLogLines: 5,
			suppressErrorSummary: true,
			suppressFailed: false,
			suppressPassed: false,
			suppressSkipped: true,
			showSpecTiming: false
		},

		captureTimeout: 5000,
		browserDisconnectTimeout: 2000,
		browserNoActivityTimeout: 30000
	};

	config.set(configuration);
};
