import { Component, ElementRef, Inject, Input, NgZone, Renderer2, SkipSelf, forwardRef } from "@angular/core";
import { Model } from "@lchemy/model";
import { ValidationResult, Validator } from "@lchemy/model/validation";

import { FormContainer } from "./base";

// TODO: due to https://github.com/Microsoft/TypeScript/issues/13449
export const _FormGroupComponentValidator = Validator; // tslint:disable-line

@Component({
	selector: "lc-form-group",
	template: `
		<ng-content></ng-content>
	`,
	providers: [{
		provide: FormContainer,
		useExisting: forwardRef(() => FormGroupComponent)
	}]
})
export class FormGroupComponent<M extends Model> extends FormContainer<M> {
	@Input()
	model: M;

	@Input()
	validator: Validator<M> | undefined;

	@Input()
	validationDebounce: number | undefined;



	constructor(
		@SkipSelf() @Inject(FormContainer) container: FormContainer<any>,
		elemRef: ElementRef,
		renderer2: Renderer2,
		ngZone: NgZone
	) {
		super(container, elemRef, renderer2, ngZone);
	}



	validate(): Promise<ValidationResult> {
		return super.validate(this.validationDebounce);
	}
}
