import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Model } from "@lchemy/model";
import { Subscription } from "rxjs";

import { FormContainer } from "./base";

@Component({
	selector: "lc-form-error-summary",
	template: `
		<div>
		</div>
	`
})
export class FormErrorSummaryComponent<M extends Model> implements OnInit, OnDestroy {
	@Input()
	form: FormContainer<M>;

	validating: boolean;


	private formValidatingChangeSubscription?: Subscription;
	ngOnInit(): void {
		this.formValidatingChangeSubscription = this.form.validatingChange.subscribe((validating) => {
			this.validating = validating;

			if (validating) {
				return;
			}
		});
	}

	ngOnDestroy(): void {
		if (this.formValidatingChangeSubscription != null) {
			this.formValidatingChangeSubscription.unsubscribe();
		}
	}
}
