import { Component, ElementRef, Inject, Input, NgZone, Optional, Renderer2, forwardRef } from "@angular/core";
import { Model } from "@lchemy/model";
import { ValidationResult, Validator } from "@lchemy/model/validation";

import { FormContainer } from "./base/form-container";
import { FormControlClasses } from "./base/form-control";
import { FORM_CLASSES, FormClasses } from "./form-classes";
import { formClassToControlClasses } from "./utils/form-class-to-control-classes";

// TODO: due to https://github.com/Microsoft/TypeScript/issues/13449
export const _FormComponentValidator = Validator; // tslint:disable-line

@Component({
	selector: "lc-form",
	template: `
		<form autocomplete="off" novalidate onsubmit="return false" ngNoForm>
			<ng-content></ng-content>
		</form>
	`,
	providers: [{
		provide: FormContainer,
		useExisting: forwardRef(() => FormComponent)
	}]
})
export class FormComponent<M extends Model> extends FormContainer<M> {
	@Input()
	model: M;

	@Input()
	validator: Validator<M> | undefined;

	@Input()
	validationDebounce: number | undefined;



	constructor(
		elemRef: ElementRef,
		renderer2: Renderer2,
		ngZone: NgZone,
		@Optional() @Inject(FORM_CLASSES) private formClasses: FormClasses
	) {
		super(undefined, elemRef, renderer2, ngZone);
	}

	protected getClasses(): FormControlClasses {
		return formClassToControlClasses(this.formClasses != null ? this.formClasses.form : undefined);
	}



	validate(): Promise<ValidationResult> {
		return super.validate(this.validationDebounce);
	}
}
