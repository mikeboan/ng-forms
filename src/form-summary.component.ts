import { Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Optional, Output, Renderer2 } from "@angular/core";
import { Model } from "@lchemy/model";
import { ValidationResult } from "@lchemy/model/validation";
import { Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";

import { FormContainer } from "./base/form-container";
import { FormField } from "./base/form-field";
import { FORM_CLASSES, FormClasses, FormSummaryClasses } from "./form-classes";
import { DEFAULT_FORM_SUMMARY_ERROR_LABELS, FORM_SUMMARY_ERROR_LABELS, FormSummaryErrorLabels } from "./form-summary-error-labels";

export interface FormSummaryItem {
	label: string;
	field?: FormField<any, any>;
}

export interface FormSummaryError {
	label: string;
	items: FormSummaryItem[];
}

@Component({
	selector: "lc-form-summary",
	template: `
		<span *ngFor="let error of errors" [ngClass]="errorClass">
			<span [ngClass]="errorLabelClass">
				{{ error.label }}
			</span>
			<span [ngClass]="errorFieldsClass">
				<ng-template ngFor [ngForOf]="error.items" let-item>
					<ng-template [ngIf]="item.field != null" [ngIfThen]="thenBlock" [ngIfElse]="elseBlock"></ng-template>
					<ng-template #thenBlock>
						<span tabindex="0" (click)="onSelectField(item.field)" (keydown.space)="onSelectField(item.field)" [ngClass]="fieldLabelClass">
							{{ item.label }}
						</span>
					</ng-template>
					<ng-template #elseBlock>
						<span tabindex="0" [ngClass]="fieldLabelClass">
							{{ item.label }}
						</span>
					</ng-template>
				</ng-template>
			</span>
		</span>
	`
})
export class FormSummaryComponent<M extends Model> implements OnInit, OnDestroy {
	@Input()
	form: FormContainer<M>;



	@Input()
	get fieldLabels(): { [key: string]: string } {
		return this._fieldLabels;
	}
	set fieldLabels(value: { [key: string]: string }) {
		if (deepCompareLabels(this._fieldLabels, value)) {
			return;
		}

		this._fieldLabels = value;
		this.updateErrors();
	}
	private _fieldLabels: { [key: string]: string };



	@Input()
	get errorLabels(): FormSummaryErrorLabels {
		return this._errorLabels;
	}
	set errorLabels(value: FormSummaryErrorLabels) {
		if (deepCompareLabels(this._customErrorLabels, value)) {
			return;
		}
		this._customErrorLabels = value;
		this._errorLabels = {
			...DEFAULT_FORM_SUMMARY_ERROR_LABELS,
			...this.globalErrorLabels,
			...value
		};
	}
	private _errorLabels: FormSummaryErrorLabels;
	private _customErrorLabels: FormSummaryErrorLabels;



	@Output()
	selectField: EventEmitter<FormField<M, any>> = new EventEmitter<FormField<M, any>>();

	validating: boolean;



	/**
	 * @internal
	 */
	summaryClass: { [key: string]: true } = {};

	/**
	 * @internal
	 */
	errorClass: { [key: string]: true } = {};

	/**
	 * @internal
	 */
	errorLabelClass: { [key: string]: true } = {};

	/**
	 * @internal
	 */
	errorFieldsClass: { [key: string]: true } = {};

	/**
	 * @internal
	 */
	fieldLabelClass: { [key: string]: true } = {};


	private fields: Array<FormField<M, any>> = [];

	constructor(
		private elemRef: ElementRef,
		private renderer2: Renderer2,
		@Optional() @Inject(FORM_SUMMARY_ERROR_LABELS) private globalErrorLabels: FormSummaryErrorLabels,
		@Optional() @Inject(FORM_CLASSES) private formClasses: FormClasses
	) {
		this.errorLabels = {
			...DEFAULT_FORM_SUMMARY_ERROR_LABELS,
			...globalErrorLabels
		};
	}

	private initClasses(): void {
		let formClasses: FormClasses = this.formClasses != null ? this.formClasses : {},
			summaryClasses: FormSummaryClasses = formClasses.summary != null ? formClasses.summary : {};

		if (summaryClasses.summary != null) {
			this.renderer2.addClass(this.elemRef.nativeElement, summaryClasses.summary);
		}
		if (summaryClasses.error != null) {
			this.errorClass[summaryClasses.error] = true;
		}
		if (summaryClasses.errorLabel != null) {
			this.errorLabelClass[summaryClasses.errorLabel] = true;
		}
		if (summaryClasses.errorFields != null) {
			this.errorFieldsClass[summaryClasses.errorFields] = true;
		}
		if (summaryClasses.fieldLabel != null) {
			this.fieldLabelClass[summaryClasses.fieldLabel] = true;
		}
	}

	private formFieldsChangeSubscription?: Subscription;
	private formLabelsChangeSubscription?: Subscription;
	private formValidatingChangeSubscription?: Subscription;
	ngOnInit(): void {
		this.initClasses();

		this.formFieldsChangeSubscription = this.form.fieldsChange.pipe(debounceTime(0)).subscribe(() => {
			this.fields = Array.from(this.form.getFields());
			this.updateErrors();
		});

		this.formLabelsChangeSubscription = this.form.labelsChange.pipe(debounceTime(0)).subscribe(() => {
			this.updateErrors();
		});

		this.formValidatingChangeSubscription = this.form.validatingChange.subscribe((validating) => {
			this.validating = validating;

			if (validating) {
				return;
			}

			this.updateErrors();
		});

		this.fields = Array.from(this.form.getFields());
		this.updateErrors();
	}

	ngOnDestroy(): void {
		if (this.formFieldsChangeSubscription != null) {
			this.formFieldsChangeSubscription.unsubscribe();
		}
		if (this.formLabelsChangeSubscription != null) {
			this.formLabelsChangeSubscription.unsubscribe();
		}
		if (this.formValidatingChangeSubscription != null) {
			this.formValidatingChangeSubscription.unsubscribe();
		}
	}


	onSelectField(field: FormField<M, any>): void {
		this.selectField.emit(field);
	}



	errors: FormSummaryError[] = [];
	private updateErrors(): void {
		// TODO
		if (this.form.validationResult == null) {
			return;
		}

		let errorsMap: { [label: string]: { [path: string]: FormSummaryItem } } = {};

		this.fields.filter((field) => {
			return field.invalid && field.label != null;
		}).forEach((field) => {
			let label: string = field.label!,
				path: string = field.path;
			Object.keys(field.validationResult!.errors!).forEach((key) => {
				let errorLabel: string = this.errorLabels[key] != null ? this.errorLabels[key] : key;
				if (errorsMap[errorLabel] == null) {
					errorsMap[errorLabel] = {};
				}
				errorsMap[errorLabel][path] = { label, field };
			});
		});

		if (this.fieldLabels != null) {
			Object.keys(this.fieldLabels).map((path) => {
				return [path, this.form.validationResult!.get(path)] as [string, ValidationResult];
			}).filter(([_, results]) => {
				return results != null && !results.isValid;
			}).forEach(([path, results]) => {
				let label: string = this.fieldLabels[path];
				Object.keys(results.errors!).forEach((key) => {
					let errorLabel: string = this.errorLabels[key] != null ? this.errorLabels[key] : key;
					if (errorsMap[errorLabel] == null) {
						errorsMap[errorLabel] = {};
					}
					if (errorsMap[errorLabel][path] != null) {
						errorsMap[errorLabel][path].label = label;
					} else {
						errorsMap[errorLabel][path] = { label };
					}
				});
			});
		}

		this.errors = Object.keys(errorsMap).map((label) => {
			let itemsMap: { [path: string]: FormSummaryItem } = errorsMap[label];
			let items: FormSummaryItem[] = Object.keys(itemsMap).map((path) => {
				return itemsMap[path];
			}).sort((a, b) => {
				return a.label > b.label ? 1 : -1;
			});

			return { label, items };
		}).sort((a, b) => {
			return a.label > b.label ? 1 : -1;
		});
	}
}

function deepCompareLabels(labels1?: { [key: string]: string }, labels2?: { [key: string]: string }): boolean {
	if (labels1 === labels2) {
		return true;
	}
	if ((labels1 == null) !== (labels2 == null)) {
		return false;
	}
	if (labels1 == null || labels2 == null) {
		return false;
	}

	let paths1: string[] = Object.keys(labels1),
		paths2: string[] = Object.keys(labels2);

	if (paths1.length !== paths2.length) {
		return false;
	}

	return paths1.every((path) => {
		return labels1[path] === labels2[path];
	});
}
