import { Directive, DoCheck, ElementRef, Input, NgZone } from "@angular/core";
import { Model } from "@lchemy/model";

import { FormContainer } from "./base/form-container";
import { FormLabel } from "./base/form-label";

@Directive({
	selector: "[lcFormFieldLabel]:not([lcFormField])"
})
export class FormFieldLabelDirective<M extends Model> extends FormLabel<M> implements DoCheck {
	@Input()
	get lcFormFieldLabel(): string {
		return this.path;
	}
	set lcFormFieldLabel(value: string) {
		this.path = value;
	}



	constructor(
		container: FormContainer<M>,
		private elemRef: ElementRef,
		private ngZone: NgZone
	) {
		super(container);
	}

	private debouncedLabelCheck: any;
	ngDoCheck(): void {
		clearTimeout(this.debouncedLabelCheck);

		this.ngZone.runOutsideAngular(() => {
			this.debouncedLabelCheck = setTimeout(() => {
				let label: string = ((this.elemRef.nativeElement as HTMLElement).textContent || "").trim();
				if (this.label !== label) {
					this.ngZone.run(() => {
						this.label = label;
					});
				}
			}, 50);
		});
	}
}
