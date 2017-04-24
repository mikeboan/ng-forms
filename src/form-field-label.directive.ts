import { Directive, DoCheck, ElementRef, Inject, Input, NgZone } from "@angular/core";
import { Model } from "@lchemy/model";

import { FormContainer, FormLabel } from "./base";

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
		@Inject(FormContainer) container: FormContainer<M>,
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
