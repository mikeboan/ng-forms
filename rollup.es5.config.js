import buble from "rollup-plugin-buble";
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
	entry: "./dist/lchemy/ng-forms.js",
	dest: "./dist/lchemy/ng-forms.es5.js",
	format: "es",
	sourceMap: true,
	external: (id) => {
		return external.some((pkg) => {
			return id === pkg || id.indexOf(pkg + "/") === 0;
		});
	},
	plugins: [
		sourcemaps(),
		buble({
			transforms: {
				modules: false
			}
		})
	],
	onwarn: (message) => {
		if (message.code === "UNUSED_EXTERNAL_IMPORT" || message.code === "THIS_IS_UNDEFINED") {
			return;
		}
		console.error(message);
	}
};

// buble ./dist/lchemy/ng-forms.js -o ./dist/lchemy/ng-forms.es5.js --sourcemap --no modules
