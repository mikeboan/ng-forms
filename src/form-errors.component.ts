import { AfterContentInit, Component, ContentChildren, ElementRef, Inject, Input, OnDestroy, OnInit, Optional, QueryList, Renderer2, TemplateRef } from "@angular/core";
import { Model } from "@lchemy/model";
import { ValidationResult } from "@lchemy/model/validation";
import { Subscription } from "rxjs";

import { FormContainer, FormField } from "./base";
import { DEFAULT_FORM_ERROR_MESSAGES, FORM_ERROR_MESSAGES, FormErrorMessage, FormErrorMessages } from "./form-error-messages";
import { FormErrorContext, FormErrorDirective } from "./form-error.directive";

export interface FormErrorStringEnvelope {
	error: string;
	type: "string";
	content: string;
}
export interface FormErrorTemplateEnvelope {
	error: string;
	type: "template";
	content: TemplateRef<FormErrorContext>;
	context: FormErrorContext;
}
export type FormErrorEnvelope = FormErrorStringEnvelope | FormErrorTemplateEnvelope;

@Component({
	selector: "lc-form-errors",
	template: `
		<ng-template ngFor let-envelope [ngForOf]="errorEnvelopes">
			<span [ngSwitch]="envelope.type">
				<ng-template ngSwitchCase="string">
					{{ envelope.content }}
				</ng-template>
				<ng-template ngSwitchCase="template">
					<ng-template [ngTemplateOutlet]="envelope.content"
						[ngOutletContext]="{ $implicit: envelope.context, error: envelope.context }">
					</ng-template>
				</ng-template>
			</span>
		</ng-template>
	`
})
export class FormErrorsComponent<M extends Model> implements OnInit, AfterContentInit, OnDestroy {
	@ContentChildren(FormErrorDirective) templateErrors: QueryList<FormErrorDirective>;



	@Input()
	get name(): string {
		return this._name;
	}
	set name(val: string) {
		this._name = val;
		this.updateErrors();
	}
	private _name: string;

	validationResult: ValidationResult | undefined;

	errorEnvelopes: FormErrorEnvelope[] = [];



	private field: FormField<M, any> | undefined;
	private formErrorMessages: FormErrorMessages;



	constructor(
		@Inject(FormContainer) private container: FormContainer<M>,
		@Optional() @Inject(FORM_ERROR_MESSAGES) formErrorMessages: FormErrorMessages,
		private elemRef: ElementRef,
		private renderer2: Renderer2
	) {
		this.formErrorMessages = Object.assign({}, DEFAULT_FORM_ERROR_MESSAGES, formErrorMessages);
	}



	private containerValidatingChangeSubscription?: Subscription;
	private containerFieldsChangeSubscription?: Subscription;
	ngOnInit(): void {
		this.containerFieldsChangeSubscription = this.container.fieldsChange.map(() => {
			if (this.name == null) {
				return;
			}
			return this.container.getField(this.name);
		}).subscribe((field) => {
			this.field = field;
			this.updateField();
		});

		this.containerValidatingChangeSubscription = this.container.validatingChange.subscribe((validating) => {
			this.toggleClass("lc-validating", validating);

			if (!validating) {
				if (this.name != null && this.container.validationResult != null) {
					this.validationResult = this.container.validationResult.get(this.name);
				}

				let isValid: boolean = this.validationResult == null || this.validationResult.isValid;
				this.toggleClass("lc-invalid", !isValid);
				this.toggleClass("lc-valid", isValid);

				this.updateErrors();
			}
		});
	}

	private templateErrorsChangesSubscription?: Subscription;
	ngAfterContentInit(): void {
		this.templateErrorsChangesSubscription = this.templateErrors.changes.subscribe(() => {
			this.updateTemplateErrorsMap();
		});
		this.updateTemplateErrorsMap();
	}

	ngOnDestroy(): void {
		if (this.containerFieldsChangeSubscription != null) {
			this.containerFieldsChangeSubscription.unsubscribe();
		}
		if (this.containerValidatingChangeSubscription != null) {
			this.containerValidatingChangeSubscription.unsubscribe();
		}
		if (this.templateErrorsChangesSubscription != null) {
			this.templateErrorsChangesSubscription.unsubscribe();
		}
		if (this.fieldDirtyChangeSubscription != null) {
			this.fieldDirtyChangeSubscription.unsubscribe();
		}
		if (this.fieldTouchedChangeSubscription != null) {
			this.fieldTouchedChangeSubscription.unsubscribe();
		}
	}


	private toggleClass(className: string, toggle: boolean): void {
		this.renderer2[toggle ? "addClass" : "removeClass"](this.elemRef.nativeElement, className);
	}

	private fieldDirtyChangeSubscription?: Subscription;
	private fieldTouchedChangeSubscription?: Subscription;
	private updateField(): void {
		if (this.fieldDirtyChangeSubscription != null) {
			this.fieldDirtyChangeSubscription.unsubscribe();
		}
		if (this.fieldTouchedChangeSubscription != null) {
			this.fieldTouchedChangeSubscription.unsubscribe();
		}

		this.toggleClass("lc-no-field", this.field == null);

		if (this.field == null) {
			return;
		}

		type StateSubscriber = (test: boolean) => void;
		let dirtySubscriber: StateSubscriber = (test) => {
			this.toggleClass("lc-dirty", test);
			this.toggleClass("lc-pristine", !test);
		};
		let touchedSubscriber: StateSubscriber = (test) => {
			this.toggleClass("lc-touched", test);
			this.toggleClass("lc-untouched", !test);
		};
		this.fieldDirtyChangeSubscription = this.field.dirtyChange.subscribe(dirtySubscriber);
		this.fieldTouchedChangeSubscription = this.field.touchedChange.subscribe(touchedSubscriber);

		dirtySubscriber(this.field.dirty);
		touchedSubscriber(this.field.touched);
	}

	private templateErrorsMap: { [key: string]: FormErrorDirective } = {};
	private updateTemplateErrorsMap(): void {
		this.templateErrorsMap = this.templateErrors.reduce((memo, templateError) => {
			memo[templateError.name] = templateError;
			return memo;
		}, {});

		this.updateErrors();
	}

	private updateErrors(): void {
		let result: ValidationResult | undefined = this.validationResult;
		if (result == null || result.errors == null) {
			this.errorEnvelopes = [];
			return;
		}

		this.errorEnvelopes = Object.keys(result.errors).map((key) => {
			if (this.templateErrorsMap[key] != null) {
				return {
					error: key,
					type: "template",
					content: this.templateErrorsMap[key].templateRef,
					context: result!.errors![key]
				} as FormErrorTemplateEnvelope;
			}

			if (this.formErrorMessages[key] != null) {
				let errorMessage: FormErrorMessage = this.formErrorMessages[key],
					content: string = typeof errorMessage === "function" ? errorMessage(result!.errors![key]) : errorMessage;
				return {
					error: key,
					type: "string",
					content
				} as FormErrorStringEnvelope;
			}

			// TODO: allow config to define default
			return {
				error: key,
				type: "string",
				content: "Value is not valid."
			} as FormErrorStringEnvelope;
		}).filter((message) => {
			return message != null;
		}).sort((a, b) => {
			// sort it to make the order of messages deterministic
			return a!.error > b!.error ? 1 : -1;
		}) as FormErrorTemplateEnvelope[];
	}
}
