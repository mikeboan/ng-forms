import { InjectionToken, ValueProvider } from "@angular/core";

export type FormErrorMessage = string | ((error: any) => string);

export interface FormErrorMessages {
	[key: string]: FormErrorMessage;
}

export const FORM_ERROR_MESSAGES: InjectionToken<FormErrorMessages> = new InjectionToken<FormErrorMessages>("LCHEMY_NGFORMS_ERROR_MESSAGES");

export const DEFAULT_FORM_ERROR_MESSAGES: FormErrorMessages = {
	// bounds
	min: ({ requiredValue }: { requiredValue: number, actualValue: number }) => {
		return `Value must be at least ${ requiredValue }.`;
	},
	max: ({ requiredValue }: { requiredValue: number, actualValue: number }) => {
		return `Value must be at most ${ requiredValue }.`;
	},
	// TODO: minDate, maxDate
	minlength: ({ requiredLength }: { requiredLength: number, actualLength: number }) => {
		return `Value must be at least ${ requiredLength } character${ requiredLength === 1 ? "" : "s" } long.`;
	},
	maxlength: ({ requiredLength }: { requiredLength: number, actualLength: number }) => {
		return `Value must be at most ${ requiredLength } character${ requiredLength === 1 ? "" : "s" } long.`;
	},
	minSize: ({ requiredSize }: { requiredSize: number, actualSize: number }) => {
		return `Value must have at least ${ requiredSize } ${ requiredSize === 1 ? "entry" : "entries" }.`;
	},
	maxSize: ({ requiredSize }: { requiredSize: number, actualSize: number }) => {
		return `Value must have at most ${ requiredSize } ${ requiredSize === 1 ? "entry" : "entries" }.`;
	},
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

export function provideFormErrorMessages(errorMessages: FormErrorMessages): ValueProvider {
	return {
		provide: FORM_ERROR_MESSAGES,
		useValue: errorMessages
	};
}
