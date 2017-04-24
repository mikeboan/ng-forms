import { Directive, Input, TemplateRef } from "@angular/core";

export interface FormErrorContext {
	$implicit: any;
	error: any;
}

@Directive({
	selector: "[lcFormError]"
})
export class FormErrorDirective {
	@Input()
	lcFormError: string;

	get name(): string {
		return this.lcFormError;
	}

	constructor(public templateRef: TemplateRef<FormErrorContext>) {

	}
}
