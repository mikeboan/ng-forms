import sourcemaps from "rollup-plugin-sourcemaps";

const external = [
	"@angular/common",
	"@angular/core",
	"@angular/forms",
	"@angular/platform-browser",
	"@lchemy/model",
	"rxjs"
];

export default {
	entry: "./dist/lchemy/ng-forms.es5.js",
	dest: "./dist/bundles/ng-forms.umd.js",
	format: "umd",
	exports: "named",
	moduleName: "lchemy.ngForms",
	sourceMap: true,
	external: (id) => {
		return external.some((pkg) => {
			return id === pkg || id.indexOf(pkg + "/") === 0;
		});
	},
	globals: {
		"@angular/common": "ng.common",
		"@angular/core": "ng.core",
		"@angular/forms": "ng.forms",
		"@angular/platform-browser": "ng.platformBrowser",
		"@lchemy/model/validation": "lchemy.model",
		"@lchemy/model": "lchemy.model",
		"rxjs/Observable": "Rx",
		"rxjs/Subject": "Rx",
		"rxjs": "Rx"
	},
	plugins: [
		sourcemaps()
	],
	onwarn: (message) => {
		// if (/but never used/.test(message)) {
		// 	return;
		// }
		console.error(message);
	}
}
