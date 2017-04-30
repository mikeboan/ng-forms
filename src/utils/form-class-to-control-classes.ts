import { FormControlClasses } from "../base/form-control";
import { BemFormClass, FormClass, OoFormClass } from "../form-classes";

export function formClassToControlClasses(formClass?: FormClass): FormControlClasses {
	if (formClass == null || typeof formClass === "string") {
		return defaultFormClassToControlClasses(formClass);
	}
	if (formClass.hasOwnProperty("element")) {
		return bemFormClassToControlClasses(formClass as BemFormClass);
	}
	return ooFormClassToControlClasses(formClass as OoFormClass);
}

// TODO: condense these definitions somehow?
function defaultFormClassToControlClasses(formClass?: string): FormControlClasses {
	return {
		base: formClass,
		state: {
			untouched: "lc-untouched",
			touched: "lc-touched",
			pristine: "lc-pristine",
			dirty: "lc-dirty",
			valid: "lc-valid",
			invalid: "lc-invalid",
			validating: "lc-validating"
		}
	};
}

function bemFormClassToControlClasses(formClass: BemFormClass): FormControlClasses {
	let element: string = formClass.element,
		separator: string = formClass.separator != null ? formClass.separator : "--";

	return {
		base: element,
		state: {
			untouched: `${ element }${ separator }untouched`,
			touched: `${ element }${ separator }touched`,
			pristine: `${ element }${ separator }pristine`,
			dirty: `${ element }${ separator }dirty`,
			valid: `${ element }${ separator }valid`,
			invalid: `${ element }${ separator }invalid`,
			validating: `${ element }${ separator }validating`
		}
	};
}

function ooFormClassToControlClasses(formClass: OoFormClass): FormControlClasses {
	let object: string = formClass.object,
		modifierPrefix: string = formClass.modifierPrefix != null ? formClass.modifierPrefix : "lc-";

	return {
		base: object,
		state: {
			untouched: `${ modifierPrefix }untouched`,
			touched: `${ modifierPrefix }touched`,
			pristine: `${ modifierPrefix }pristine`,
			dirty: `${ modifierPrefix }dirty`,
			valid: `${ modifierPrefix }valid`,
			invalid: `${ modifierPrefix }invalid`,
			validating: `${ modifierPrefix }validating`
		}
	};
}
