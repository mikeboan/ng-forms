import { InjectionToken, ValueProvider } from "@angular/core";

export interface BemFormClass {
	element: string;
	separator?: string;
}
export interface OoFormClass {
	object: string;
	modifierPrefix?: string;
}

export type FormClass = BemFormClass | OoFormClass | string;

export interface FormSummaryClasses {
	summary?: string;
	error?: string;
	errorLabel?: string;
	errorFields?: string;
	fieldLabel?: string;
}

export interface FormClasses {
	field?: FormClass;
	form?: FormClass;
	formGroup?: FormClass;
	summary?: FormSummaryClasses;
	errors?: FormClass;
	error?: string;
}

export const FORM_CLASSES = new InjectionToken<FormClasses>("LCHEMY_NGFORMS_FORM_CLASSES");

export function provideFormClasses(classes: FormClasses): ValueProvider {
	return {
		provide: FORM_CLASSES,
		useValue: classes
	};
}
