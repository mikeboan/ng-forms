import { AfterContentInit, Component, ContentChildren, ElementRef, Inject, Input, OnDestroy, OnInit, Optional, QueryList, Renderer2, TemplateRef } from "@angular/core";
import { Model } from "@lchemy/model";
import { ValidationResult } from "@lchemy/model/validation";
import { Subscription } from "rxjs";
import { map } from "rxjs/operators";

import { FormContainer } from "./base/form-container";
import { FormField } from "./base/form-field";
import { BemFormClass, FORM_CLASSES, FormClass, FormClasses, OoFormClass } from "./form-classes";
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

export interface FormErrorsClasses {
	errors?: string;
	error?: string;
	state: {
		noField: string,
		untouched: string,
		touched: string,
		pristine: string,
		dirty: string,
		valid: string,
		invalid: string,
		validating: string
	};
}

@Component({
	selector: "lc-form-errors",
	template: `
		<ng-template ngFor let-envelope [ngForOf]="errorEnvelopes">
			<span [ngClass]="errorClass" [ngSwitch]="envelope.type">
				<ng-template ngSwitchCase="string">
					{{ envelope.content }}
				</ng-template>
				<ng-template ngSwitchCase="template">
					<ng-template [ngTemplateOutlet]="envelope.content"
						[ngTemplateOutletContext]="{ $implicit: envelope.context, error: envelope.context }">
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

	/**
	 * @internal
	 */
	errorClass: { [key: string]: true } = {};


	private field: FormField<M, any> | undefined;
	private formErrorMessages: FormErrorMessages;



	constructor(
		private container: FormContainer<M>,
		@Optional() @Inject(FORM_ERROR_MESSAGES) formErrorMessages: FormErrorMessages,
		private elemRef: ElementRef,
		private renderer2: Renderer2,
		@Optional() @Inject(FORM_CLASSES) private formClasses: FormClasses
	) {
		this.formErrorMessages = {
			...DEFAULT_FORM_ERROR_MESSAGES,
			...formErrorMessages
		};
	}

	// TODO: extract this to somewhere else
	private classes: FormErrorsClasses;
	private initClasses(): void {
		let formClasses: FormClasses = this.formClasses != null ? this.formClasses : {},
			errorsClass: FormClass | undefined = formClasses.errors;

		let errorsBase: string | undefined,
			modifierPrefix: string;
		if (errorsClass == null) {
			modifierPrefix = "lc-";
		} else if (typeof errorsClass === "string") {
			errorsBase = errorsClass;
			modifierPrefix = "lc-";
		} else if (errorsClass.hasOwnProperty("element")) {
			errorsClass = errorsClass as BemFormClass;
			errorsBase = errorsClass.element;
			modifierPrefix = errorsBase + (errorsClass.separator != null ? errorsClass.separator : "--");
		} else {
			errorsClass = errorsClass as OoFormClass;
			errorsBase = errorsClass.object;
			modifierPrefix = errorsClass.modifierPrefix != null ? errorsClass.modifierPrefix : "lc-";
		}

		let errorBase: string | undefined = formClasses.error;

		this.classes = {
			errors: errorsBase,
			error: errorBase,
			state: {
				noField: `${ modifierPrefix }no-field`,
				untouched: `${ modifierPrefix }untouched`,
				touched: `${ modifierPrefix }touched`,
				pristine: `${ modifierPrefix }pristine`,
				dirty: `${ modifierPrefix }dirty`,
				valid: `${ modifierPrefix }valid`,
				invalid: `${ modifierPrefix }invalid`,
				validating: `${ modifierPrefix }validating`
			}
		};
	}



	private containerValidatingChangeSubscription?: Subscription;
	private containerFieldsChangeSubscription?: Subscription;
	ngOnInit(): void {
		this.containerFieldsChangeSubscription = this.container.fieldsChange.pipe(map(() => {
			if (this.name == null) {
				return;
			}
			return this.container.getField(this.name);
		})).subscribe((field) => {
			this.field = field;
			this.updateField();
		});

		this.initClasses();
		if (this.classes.errors != null) {
			this.toggleClass(this.classes.errors, true);
		}
		if (this.classes.error != null) {
			this.errorClass[this.classes.error] = true;
		}

		this.containerValidatingChangeSubscription = this.container.validatingChange.subscribe((validating) => {
			this.toggleClass(this.classes.state.validating, validating);

			if (!validating) {
				if (this.name != null && this.container.validationResult != null) {
					this.validationResult = this.container.validationResult.get(this.name);
				}

				let isValid: boolean = this.validationResult == null || this.validationResult.isValid;
				this.toggleClass(this.classes.state.invalid, !isValid);
				this.toggleClass(this.classes.state.valid, isValid);

				this.updateErrors();
			}
		});

		this.field = this.container.getField(this.name);
		this.updateField();
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

		this.toggleClass(this.classes.state.noField, this.field == null);

		if (this.field == null) {
			return;
		}

		type StateSubscriber = (test: boolean) => void;
		let dirtySubscriber: StateSubscriber = (test) => {
			this.toggleClass(this.classes.state.dirty, test);
			this.toggleClass(this.classes.state.pristine, !test);
		};
		let touchedSubscriber: StateSubscriber = (test) => {
			this.toggleClass(this.classes.state.touched, test);
			this.toggleClass(this.classes.state.untouched, !test);
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
				};
			}

			if (this.formErrorMessages[key] != null) {
				let errorMessage: FormErrorMessage = this.formErrorMessages[key],
					content: string = typeof errorMessage === "function" ? errorMessage(result!.errors![key]) : errorMessage;
				return {
					error: key,
					type: "string",
					content
				};
			}

			// TODO: allow config to define default
			return {
				error: key,
				type: "string",
				content: "Value is not valid."
			};
		}).filter((message) => {
			return message != null;
		}).sort((a, b) => {
			// sort it to make the order of messages deterministic
			return a!.error > b!.error ? 1 : -1;
		}) as FormErrorTemplateEnvelope[];
	}
}
