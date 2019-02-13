import { Directive, ElementRef, EventEmitter, Inject, Input, Optional, Output, Renderer2, Self } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Model } from "@lchemy/model";
import { filter } from "rxjs/operators";

import { FormContainer } from "./base/form-container";
import { FormControlClasses } from "./base/form-control";
import { FormField } from "./base/form-field";
import { selectValueAccessor } from "./common-accessors";
import { FORM_CLASSES, FormClasses } from "./form-classes";
import { formClassToControlClasses } from "./utils/form-class-to-control-classes";

const NOOP: () => void = () => { /* noop */ };

@Directive({
	selector: "[lcFormField]",
	exportAs: "lcFormField"
})
export class FormFieldDirective<M extends Model, T> extends FormField<M, T> {
	@Input()
	get name(): string {
		return this.path;
	}
	set name(value: string) {
		if (value == null || value === "") {
			return;
		}
		this.path = value;
	}

	@Input()
	get lcFormField(): string {
		return this.path;
	}
	set lcFormField(value: string) {
		if (value == null || value === "") {
			return;
		}
		this.path = value;
	}



	@Input()
	get lcFormLabel(): string | undefined {
		return this.label;
	}
	set lcFormLabel(value: string | undefined) {
		this.label = value;
	}



	@Output()
	lcFormFieldChange: EventEmitter<T | undefined> = this.valueChange;



	private valueAccessor: ControlValueAccessor | undefined;
	constructor(
		container: FormContainer<M>,
		@Optional() @Self() @Inject(NG_VALUE_ACCESSOR) valueAccessors: ControlValueAccessor[],
		elemRef: ElementRef,
		renderer2: Renderer2,
		@Optional() @Inject(FORM_CLASSES) private formClasses: FormClasses
	) {
		super(container, elemRef, renderer2);
		this.valueAccessor = selectValueAccessor(valueAccessors);
	}

	protected getClasses(): FormControlClasses {
		return formClassToControlClasses(this.formClasses != null ? this.formClasses.field : undefined);
	}

	private valueChangeSubscription: { unsubscribe(): void };
	protected registerControl(): void {
		super.registerControl();

		if (this.valueAccessor == null) {
			return;
		}

		// initialize view from model
		let viewValue: T | undefined = this.getModelValue();
		this.valueAccessor.writeValue(viewValue);

		// update value accessor on value change
		this.valueChangeSubscription = this.valueChange.pipe(filter((value) => {
			return value !== viewValue;
		})).subscribe((value) => {
			viewValue = value;
			this.valueAccessor!.writeValue(value);
		});

		// register view changes to update model
		this.valueAccessor.registerOnChange((value: T | undefined) => {
			viewValue = value;

			if (this.getModelValue() === value) {
				this.container.validate();
				return;
			}

			this.setModelValue(value);
			this.markAsDirty();
		});

		// register view touched to set touched state
		this.valueAccessor.registerOnTouched(() => {
			this.markAsTouched();
		});
	}

	protected unregisterControl(): void {
		super.unregisterControl();

		if (this.valueAccessor == null) {
			return;
		}

		// TODO: do this better?
		this.valueAccessor.registerOnChange(NOOP);
		this.valueAccessor.registerOnTouched(NOOP);

		if (this.valueChangeSubscription != null) {
			this.valueChangeSubscription.unsubscribe();
		}
	}
}
