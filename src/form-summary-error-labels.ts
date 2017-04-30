import { InjectionToken, ValueProvider } from "@angular/core";

export interface FormSummaryErrorLabels {
	[key: string]: string;
}

export const FORM_SUMMARY_ERROR_LABELS: InjectionToken<FormSummaryErrorLabels> = new InjectionToken<FormSummaryErrorLabels>("LCHEMY_NGFORMS_SUMMARY_ERROR_LABELS");

export const DEFAULT_FORM_SUMMARY_ERROR_LABELS: FormSummaryErrorLabels = {
	// bounds
	min: "Value is too low.",
	max: "Value is too high.",
	// TODO: minDate, maxDate
	minlength: "Value is too short.",
	maxlength: "Value is too long.",
	minSize: "Value has too few entries.",
	maxSize: "Value has too many entries.",
	isIn: "Value is not valid.",


	// conditional
	required: "Value is required.",


	// nested
	each: "Provided children are invalid.",
	object: "Value is not valid.",
	model: "Value is not valid.",


	// string
	isEmail: "Value must be a valid email.",
	regex: "Value is not valid.",


	// types
	isBoolean: "Value is not valid.",
	isString: "Value is not valid.",
	isNumber: "Value must be a number.",
	isInt: "Value must be an integer.",
	isDate: "Value must be a valid date.",
	isArray: "Value is not valid.",
	isObject: "Value is not valid."
};

export function provideFormSummaryErrorLabels(summaryErrorLabels: FormSummaryErrorLabels): ValueProvider {
	return {
		provide: FORM_SUMMARY_ERROR_LABELS,
		useValue: summaryErrorLabels
	};
}
