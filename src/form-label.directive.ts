import { Directive, DoCheck, ElementRef, Input, NgZone, OnDestroy, OnInit } from "@angular/core";
import { Model } from "@lchemy/model";
import { Subscription } from "rxjs";

import { FormContainer } from "./base/form-container";
import { FormField } from "./base/form-field";

@Directive({
	selector: "[lcFormLabel]:not([lcFormField])"
})
export class FormLabelDirective<M extends Model> implements OnInit, DoCheck, OnDestroy {
	@Input()
	get lcFormLabel(): string {
		return this.path;
	}
	set lcFormLabel(value: string) {
		this.path = value;
	}



	get path(): string {
		return this._path;
	}
	set path(value: string) {
		if (this._path === value) {
			return;
		}

		this._path = value;
		this.updateField();
	}
	private _path: string;



	get label(): string {
		return this._label;
	}
	private _label: string;



	constructor(
		private container: FormContainer<M>,
		private elemRef: ElementRef,
		private ngZone: NgZone
	) {

	}

	private field: FormField<M, any> | undefined;
	private containerFieldsChangeSubscription?: Subscription;
	ngOnInit(): void {
		this.containerFieldsChangeSubscription = this.container.fieldsChange.subscribe(() => {
			this.updateField();
		});
	}

	private debouncedLabelCheck: any;
	ngDoCheck(): void {
		clearTimeout(this.debouncedLabelCheck);

		this.ngZone.runOutsideAngular(() => {
			this.debouncedLabelCheck = setTimeout(() => {
				let label: string = ((this.elemRef.nativeElement as HTMLElement).textContent || "").trim();
				if (this.label !== label) {
					this.ngZone.run(() => {
						this._label = label;
						this.updateFieldLabel();
					});
				}
			}, 50);
		});
	}

	ngOnDestroy(): void {
		if (this.containerFieldsChangeSubscription != null) {
			this.containerFieldsChangeSubscription.unsubscribe();
		}
	}

	private updateField(): void {
		let field: FormField<M, any> | undefined = this.container.getField(this.path);
		if (this.field === field) {
			return;
		}
		this.field = field;
		this.updateFieldLabel();
	}

	private updateFieldLabel(): void {
		if (this.field == null) {
			return;
		}
		this.field.label = this.label;
	}
}
