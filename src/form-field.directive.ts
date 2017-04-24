import { Directive, ElementRef, EventEmitter, Inject, Input, Optional, Output, Renderer2, Self } from "@angular/core";
import { ControlValueAccessor, DefaultValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Model } from "@lchemy/model";

import { FormContainer, FormField } from "./base";

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
	get lcFormFieldLabel(): string | undefined {
		return this.label;
	}
	set lcFormFieldLabel(value: string | undefined) {
		this.label = value;
	}



	@Output()
	lcFormFieldChange: EventEmitter<T | undefined> = this.valueChange;



	private valueAccessor: ControlValueAccessor | undefined;
	constructor(
		@Inject(FormContainer) container: FormContainer<M>,
		@Optional() @Self() @Inject(NG_VALUE_ACCESSOR) valueAccessors: ControlValueAccessor[],
		elemRef: ElementRef,
		renderer2: Renderer2
	) {
		super(container, elemRef, renderer2);
		this.valueAccessor = selectValueAccessor(valueAccessors);
	}

	private valueChangeSubscription: { unsubscribe(): void };
	protected registerControl(): void {
		super.registerControl();

		if (this.valueAccessor == null) {
			return;
		}

		// initialize view from model
		this.valueAccessor.writeValue(this.getModelValue());

		// update value accessor on value change
		this.valueChangeSubscription = this.valueChange.subscribe((value) => {
			this.valueAccessor!.writeValue(value);
		});

		// register view changes to update model
		this.valueAccessor.registerOnChange((value: T | undefined) => {
			if (this.getModelValue() === value) {
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

function selectValueAccessor(valueAccessors: ControlValueAccessor[] | undefined): ControlValueAccessor | undefined {
	if (valueAccessors == null) {
		return undefined;
	}

	let customAccessor: ControlValueAccessor | undefined = valueAccessors.find((accessor) => !(accessor instanceof DefaultValueAccessor));
	if (customAccessor != null) {
		return customAccessor;
	}

	// TODO: add built-in accessor logic?

	// default accessor
	return valueAccessors.find((accessor) => accessor instanceof DefaultValueAccessor);
}
