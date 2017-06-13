import { DoCheck, ElementRef, EventEmitter, Renderer2 } from "@angular/core";
import { Model } from "@lchemy/model";
import { ValidationResult } from "@lchemy/model/validation";

import { FormContainer } from "./form-container";
import { FormControl } from "./form-control";

export abstract class FormField<M extends Model, T> extends FormControl implements DoCheck {
	get path(): string {
		return this._path;
	}
	set path(value: string) {
		if (this._path === value) {
			return;
		}

		this._path = value;
		this.updatePath();
	}
	private _path: string;



	get label(): string | undefined {
		return this._label;
	}
	set label(value: string | undefined) {
		if (this._label === value) {
			return;
		}
		this._label = value;
		this.container.labelsChange.emit();
	}
	private _label: string | undefined;



	get elementRef(): ElementRef {
		return this.elemRef;
	}



	valueChange: EventEmitter<T | undefined> = new EventEmitter<T | undefined>();



	protected get _validating(): boolean {
		return this.container.validating;
	}

	validatingChange: EventEmitter<boolean> = this.container.validatingChange;
	validationComplete: EventEmitter<void> = this.container.validationComplete;



	constructor(
		protected container: FormContainer<M>,
		elemRef: ElementRef,
		renderer2: Renderer2
	) {
		super(container, elemRef, renderer2);
	}



	protected modelValue: T | undefined;
	ngDoCheck(): void {
		let currentValue: T | undefined = this.getModelValue();
		if (currentValue === this.modelValue) {
			return;
		}

		this.modelValue = currentValue;
		this.valueChange.emit(currentValue);
		this.container.validate();
	}



	/**
	 * @internal
	 */
	updateValidationResult(): void {
		let res: ValidationResult | undefined;
		if (this.container.validationResult != null) {
			res = this.container.validationResult.get(this.path);
		}
		this.validationResult = res;

		if (res == null || res.isValid) {
			this.markAsValid();
		} else {
			this.markAsInvalid();
		}
	}



	protected getModelValue: () => T | undefined;
	protected setModelValue: (value: T | undefined) => void;
	private updatePath(): void {
		let parts: string[] = this.path.match(/([^\.\[\]]+)/g) || [],
			count: number = parts.length;

		this.getModelValue = () => {
			// for loop is more efficient than reduce
			let i: number,
				part: string,
				memo: any = this.container.model;

			for (i = 0; i < count; i++) {
				part = parts[i];
				memo = memo[part];

				if (memo == null && i < count - 1) {
					return undefined;
				}
			}

			return memo;
		};

		this.setModelValue = (value: T | undefined) => {
			let i: number,
				part: string,
				memo: any = this.container.model;

			for (i = 0; i < count - 1; i++) {
				part = parts[i];
				if (memo[part] == null) {
					memo[part] = {};
				}
				memo = memo[part];
			}
			part = parts[i];

			if (memo[part] === value) {
				return;
			}
			memo[part] = value;
		};

		this.updateValidationResult();
	}
}
