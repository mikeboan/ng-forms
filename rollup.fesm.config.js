import resolve from "rollup-plugin-node-resolve";
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
	entry: "./compiled/ng-forms.js",
	dest: "./dist/@lchemy/ng-forms.js",
	format: "es",
	sourceMap: true,
	external: (id) => {
		return external.some((pkg) => {
			return id === pkg || id.indexOf(pkg + "/") === 0;
		});
	},
	plugins: [
		resolve({
			module: true,
			jsnext: true,
			main: true
		}),
		sourcemaps()
	],
	onwarn: (message) => {
		if (/but never used/.test(message)) {
			return;
		}
		console.error(message);
	}
};
