import { ElementRef, EventEmitter, NgZone, Renderer2 } from "@angular/core";
import { Model } from "@lchemy/model";
import { ValidationResult, Validator } from "@lchemy/model/validation";
import { Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";

import { FormControl } from "./form-control";
import { FormField } from "./form-field";

export abstract class FormContainer<M extends Model> extends FormControl {
	abstract model: M;
	abstract validator: Validator<M> | undefined;



	protected _validating: boolean = false;

	validatingChange: EventEmitter<boolean> = new EventEmitter<boolean>();
	validationComplete: EventEmitter<void> = new EventEmitter<void>();

	/**
	 * @internal
	 */
	fieldsChange: EventEmitter<void> = new EventEmitter<void>();

	/**
	 * @internal
	 */
	labelsChange: EventEmitter<void> = new EventEmitter<void>();



	constructor(
		container: FormContainer<any> | undefined,
		elemRef: ElementRef,
		renderer2: Renderer2,
		private ngZone: NgZone
	) {
		super(container, elemRef, renderer2);
	}

	private queued?: DebouncedValidationResult;
	validate(debounce?: number | undefined): Promise<ValidationResult> {
		if (this.queued != null) {
			this.queued.debounce(debounce);
			return this.queued.promise;
		}

		this.markAsValidationPending();

		this.queued = new DebouncedValidationResult(() => {
			return this._validate().then((res) => {
				delete this.queued;
				this.markAsValidationComplete();
				return res;
			}, (err) => {
				delete this.queued;
				this.markAsValidationComplete();
				return Promise.reject(err);
			});
		}, this.ngZone);

		this.queued.debounce(debounce);
		return this.queued.promise;
	}

	private _validate(): Promise<ValidationResult> {
		if (this.model == null) {
			// TODO: error
			throw new Error();
		}

		// trigger child containers' validate
		let childrenValidations: Array<Promise<ValidationResult>> = Array.from(this.containers).map((container) => {
			return container.validate();
		});

		// trigger own validate
		let selfValidation: Promise<ValidationResult>;
		if (this.validator != null) {
			selfValidation = this.validator.validate(this.model);
		} else {
			selfValidation = Promise.resolve(new ValidationResult(null, this.model));
		}

		return Promise.all(childrenValidations.concat(selfValidation)).then(() => {
			return selfValidation;
		}).then((res) => {
			this.validationResult = res;

			this.fields.forEach((field) => field.updateValidationResult());
			this.checkValidity();

			return res;
		});
	}

	private checkValidity(): void {
		// check own and child containers' validation results
		let isValid: boolean = (
			(this.validationResult == null || this.validationResult.isValid) &&
			Array.from(this.containers).every((container) => container.valid)
		);

		if (isValid) {
			this.markAsValid();
		} else {
			this.markAsInvalid();
		}
	}



	markAsPristine(): void {
		this.fields.forEach((control) => control.markAsPristine());
		this.containers.forEach((container) => container.markAsPristine());

		super.markAsPristine();
	}
	markAsDirty(): void {
		super.markAsDirty();
	}

	protected markAsValid(): void {
		super.markAsValid();

		if (this.container != null) {
			this.container.checkValidity();
		}
	}
	protected markAsInvalid(): void {
		super.markAsInvalid();

		if (this.container != null) {
			this.container.checkValidity();
		}
	}

	private markAsValidationPending(): void {
		this._validating = true;
		this.validatingChange.emit(true);
	}
	private markAsValidationComplete(): void {
		this._validating = false;
		this.validatingChange.emit(false);
		this.validationComplete.emit();
	}



	protected fields: Set<FormField<M, any>> = new Set<FormField<M, any>>();
	protected containers: Set<FormContainer<any>> = new Set<FormContainer<any>>();

	/**
	 * @internal
	 */
	addControl(control: FormControl): void {
		if (control instanceof FormField) {
			this.addField(control);
		} else if (control instanceof FormContainer) {
			this.addContainer(control);
		} else {
			throw new Error("Cannot add invalid control to form container");
		}
	}

	/**
	 * @internal
	 */
	removeControl(control: FormControl): void {
		if (control instanceof FormField) {
			this.removeField(control);
		} else if (control instanceof FormContainer) {
			this.removeContainer(control);
		} else {
			throw new Error("Cannot remove invalid control to form container");
		}
	}

	/**
	 * @internal
	 */
	addField(field: FormField<M, any>): void {
		if (this.fields.has(field)) {
			return;
		}
		this.fields.add(field);
		this.fieldsChange.emit();
	}

	/**
	 * @internal
	 */
	removeField(field: FormField<M, any>): void {
		if (!this.fields.has(field)) {
			return;
		}
		this.fields.delete(field);
		this.fieldsChange.emit();
	}

	/**
	 * @internal
	 */
	addContainer(container: FormContainer<any>): void {
		if (this.containers.has(container)) {
			return;
		}

		this.containers.add(container);
		if (container.invalid) {
			this.markAsInvalid();
		}
	}

	/**
	 * @internal
	 */
	removeContainer(container: FormContainer<any>): void {
		if (!this.containers.has(container)) {
			return;
		}
		this.containers.delete(container);
	}

	/**
	 * @internal
	 */
	getField(name: string): FormField<M, any> | undefined {
		return Array.from(this.fields).find((field) => field.path === name);
	}

	/**
	 * @internal
	 */
	getFields(): Set<FormField<M, any>> {
		return this.fields;
	}



	private fieldsChangeSubscription?: Subscription;
	protected registerControl(): void {
		super.registerControl();
		this.validate();

		this.fieldsChangeSubscription = this.fieldsChange.pipe(
			debounceTime(0)
		).subscribe(() => {
			this.validate();
		});
	}

	protected unregisterControl(): void {
		super.unregisterControl();

		if (this.fieldsChangeSubscription != null) {
			this.fieldsChangeSubscription.unsubscribe();
		}
	}
}



/**
 * @internal
 */
class DebouncedValidationResult {
	promise: Promise<ValidationResult>;

	private resolve: (res: ValidationResult) => void;
	private reject: (err: any) => void;

	constructor(private action: () => Promise<ValidationResult>, private ngZone: NgZone) {
		this.promise = new Promise<ValidationResult>((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}

	private timeout?: any;
	debounce(duration: number | undefined): void {
		if (this.executed) {
			return;
		}

		if (this.timeout) {
			clearTimeout(this.timeout);
			delete this.timeout;
		}

		if (duration == null) {
			this.execute();
		} else {
			this.ngZone.runOutsideAngular(() => {
				this.timeout = setTimeout(() => {
					this.ngZone.run(() => {
						this.execute();
					});
				}, duration);
			});
		}
	}

	private executed: boolean = false;
	private execute(): void {
		Promise.resolve().then(this.action).then((res) => {
			this.executed = true;
			this.resolve(res);
		}, (err) => {
			this.executed = true;
			this.reject(err);
		});
	}
}
