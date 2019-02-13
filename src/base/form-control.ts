import { ElementRef, EventEmitter, OnChanges, OnDestroy, Output, Renderer2 } from "@angular/core";
import { ValidationResult } from "@lchemy/model/validation";
import { Subscription, concat as observableConcat } from "rxjs";
import { distinctUntilChanged, map } from "rxjs/operators";

import { FormContainer } from "./form-container";

export interface FormControlClasses {
	base?: string;
	state: {
		untouched: string,
		touched: string,
		pristine: string,
		dirty: string,
		valid: string,
		invalid: string,
		validating: string
	};
}

export abstract class FormControl implements OnChanges, OnDestroy {
	validationResult: ValidationResult | undefined;



	get pristine(): boolean {
		return !this._dirty;
	}
	get dirty(): boolean {
		return this._dirty;
	}
	private _dirty: boolean = false;

	@Output()
	dirtyChange: EventEmitter<boolean> = new EventEmitter<boolean>();



	get untouched(): boolean {
		return !this._touched;
	}
	get touched(): boolean {
		return this._touched;
	}
	private _touched: boolean = false;

	@Output()
	touchedChange: EventEmitter<boolean> = new EventEmitter<boolean>();



	get valid(): boolean {
		return !this._invalid;
	}
	get invalid(): boolean {
		return this._invalid;
	}
	private _invalid: boolean = false;

	@Output()
	invalidChange: EventEmitter<boolean> = new EventEmitter<boolean>();



	get validating(): boolean {
		return this._validating;
	}
	protected abstract get _validating(): boolean;

	@Output()
	abstract validatingChange: EventEmitter<boolean>;

	@Output()
	abstract validationComplete: EventEmitter<void>;



	get state(): string {
		return this.validating ? "PENDING" : (this.invalid ? "INVALID" : "VALID");
	}

	@Output()
	stateChange: EventEmitter<string> = new EventEmitter<string>();


	constructor(
		protected container: FormContainer<any> | undefined,
		protected elemRef: ElementRef,
		private renderer2: Renderer2
	) {

	}

	protected abstract getClasses(): FormControlClasses;



	private registered: boolean = false;
	ngOnChanges(): void {
		if (!this.registered) {
			this.registerControl();
			this.registered = true;
		}
	}

	ngOnDestroy(): void {
		if (this.registered) {
			this.unregisterControl();
			this.registered = false;
		}
	}



	markAsPristine(): void {
		if (!this._dirty) {
			return;
		}
		this._dirty = false;
		this.dirtyChange.emit(false);
	}
	markAsDirty(): void {
		if (this._dirty) {
			return;
		}
		this._dirty = true;
		this.dirtyChange.emit(true);

		if (this.container) {
			this.container.markAsDirty();
		}
	}
	protected markAsTouched(): void {
		if (this._touched) {
			return;
		}
		this._touched = true;
		this.touchedChange.emit(true);

		if (this.container) {
			this.container.markAsTouched();
		}
	}
	protected markAsValid(): void {
		if (!this._invalid) {
			return;
		}
		this._invalid = false;
		this.invalidChange.emit(false);
	}
	protected markAsInvalid(): void {
		if (this._invalid) {
			return;
		}
		this._invalid = true;
		this.invalidChange.emit(true);
	}


	private toggleClass(className: string, toggle: boolean): void {
		this.renderer2[toggle ? "addClass" : "removeClass"](this.elemRef.nativeElement, className);
	}


	private classSubscriptions?: Subscription[];
	private emitStateChangeSubscription?: Subscription;
	protected registerControl(): void {
		if (this.container != null) {
			this.container.addControl(this);
		}

		this.emitStateChangeSubscription = observableConcat(this.invalidChange, this.validatingChange).pipe(
			map(() => {
				return this.state;
			}),
			distinctUntilChanged()
		).subscribe((state) => {
			this.stateChange.emit(state);
		});

		let classes: FormControlClasses = this.getClasses();
		if (classes.base != null) {
			this.toggleClass(classes.base, true);
		}

		type StateSubscriber = (test: boolean) => void;
		let dirtySubscriber: StateSubscriber = (test) => {
			this.toggleClass(classes.state.dirty, test);
			this.toggleClass(classes.state.pristine, !test);
		};
		let touchedSubscriber: StateSubscriber = (test) => {
			this.toggleClass(classes.state.touched, test);
			this.toggleClass(classes.state.untouched, !test);
		};
		let invalidSubscriber: StateSubscriber = (test) => {
			this.toggleClass(classes.state.invalid, test);
			this.toggleClass(classes.state.valid, !test);
		};
		let validatingSubscriber: StateSubscriber = (test) => this.toggleClass(classes.state.validating, test);

		this.classSubscriptions = [
			this.dirtyChange.subscribe(dirtySubscriber),
			this.touchedChange.subscribe(touchedSubscriber),
			this.invalidChange.subscribe(invalidSubscriber),
			this.validatingChange.subscribe(validatingSubscriber)
		];
		dirtySubscriber(this.dirty);
		touchedSubscriber(this.touched);
		invalidSubscriber(this.invalid);
		validatingSubscriber(this.validating);
	}

	protected unregisterControl(): void {
		if (this.container != null) {
			this.container.removeControl(this);
		}

		if (this.emitStateChangeSubscription != null) {
			this.emitStateChangeSubscription.unsubscribe();
			delete this.emitStateChangeSubscription;
		}

		if (this.classSubscriptions != null) {
			this.classSubscriptions.forEach((subscription) => {
				subscription.unsubscribe();
			});
			delete this.classSubscriptions;
		}
	}
}
