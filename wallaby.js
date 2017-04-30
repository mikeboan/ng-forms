"use strict";

const path = require("path"),
	webpack = require("webpack"),
	wallabyWebpack = require("wallaby-webpack");

module.exports = (wallaby) => {
	const webpackPostProcessor = wallabyWebpack({
		resolve: {
			alias: {
				"@lchemy/ng-forms": path.resolve(wallaby.projectCacheDir, "./src")
			}
		},
		entryPatterns: [
			"test/bootstrap.js",
			"test/**/*.spec.js"
		],
		module: {
			rules: [{
				test: /\.ts/,
				loaders: [{
					loader: "ts-loader"
				}],
				exclude: /node_modules/
			}]
		}
	});

	wallaby.defaults.files.load = false;
	wallaby.defaults.files.instrument = false;

	return {
		debug: false,

		files: [
			{ pattern: "src/**/*.ts", instrument: true },
			"test/**/*.ts",
			"!test/**/*.spec.ts"
		],

		tests: [
			{ pattern: "test/**/*.spec.ts", load: false, instrument: true }
		],

		testFramework: "jasmine",

		env: {
			type: "browser",
			kind: "electron"
		},

		postprocessor: webpackPostProcessor,

		setup: () => {
			window.__moduleBundler.loadTests();
		}
	}
};
