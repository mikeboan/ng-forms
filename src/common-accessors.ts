/* tslint:disable:directive-class-suffix use-host-property-decorator */

import { Directive, forwardRef } from "@angular/core";
import {
	DefaultValueAccessor as NgDefaultValueAccessor,
	NG_VALUE_ACCESSOR
} from "@angular/forms";

// TODO: checkbox, number, radio, range, select, multi-select, etc.

@Directive({
	selector: "input:not([type=checkbox])[lcFormField],textarea[lcFormField],textarea[formControl]",
	host: {
		"(input)": "_handleInput($event.target.value)",
		"(blur)": "onTouched()",
		"(compositionstart)": "_compositionStart()",
		"(compositionend)": "_compositionEnd($event.target.value)"
	},
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: forwardRef(() => DefaultValueAccessor),
		multi: true
	}]
})
export class DefaultValueAccessor extends NgDefaultValueAccessor {

}
