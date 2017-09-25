/* tslint:disable:directive-class-suffix directive-selector use-host-property-decorator */

import { Directive, ElementRef, Inject, Optional, Renderer2, forwardRef } from "@angular/core";
import { COMPOSITION_BUFFER_MODE, ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { ɵgetDOM as getDOM } from "@angular/platform-browser";

// TODO: checkbox, number, radio, range, select, multi-select, etc.

// TODO: can't extend default value accessor for some reason, figure out why?
// original from: https://github.com/angular/angular/blob/master/packages/forms/src/directives/default_value_accessor.ts

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
export class DefaultValueAccessor implements ControlValueAccessor {
	onChange = (_: any) => {}; // tslint:disable-line:no-empty
	onTouched = () => {}; // tslint:disable-line:no-empty

	private _composing: boolean = false;

	constructor(
		private _renderer: Renderer2,
		private _elementRef: ElementRef,
		@Optional() @Inject(COMPOSITION_BUFFER_MODE) private _compositionMode: boolean
	) {
		if (this._compositionMode == null) {
			this._compositionMode = !_isAndroid();
		}
	}

	writeValue(value: any): void {
		const normalizedValue = value == null ? "" : value;
		this._renderer.setProperty(this._elementRef.nativeElement, "value", normalizedValue);
	}

	registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }
	registerOnTouched(fn: () => void): void { this.onTouched = fn; }

	setDisabledState(isDisabled: boolean): void {
		this._renderer.setProperty(this._elementRef.nativeElement, "disabled", isDisabled);
	}

	_handleInput(value: any): void {
		if (!this._compositionMode || (this._compositionMode && !this._composing)) {
			this.onChange(value);
		}
	}

	_compositionStart(): void {
		this._composing = true;
	}

	_compositionEnd(value: any): void {
		this._composing = false;
		if (this._compositionMode) {
			this.onChange(value);
		}
	}
}

function _isAndroid(): boolean {
	const userAgent = getDOM() ? getDOM().getUserAgent() : "";
	return /android (\d+)/.test(userAgent.toLowerCase());
}


// original from: https://github.com/angular/angular/blob/1cfa79ca4e21788e0323baf544704ee7ef7d63ea/packages/forms/src/directives/number_value_accessor.ts
@Directive({
	selector: "input[type=number][formControlName],input[type=number][formControl],input[type=number][ngModel]",
	host: {
		"(change)": "onChange($event.target.value)",
		"(input)": "onChange($event.target.value)",
		"(blur)": "onTouched()"
	},
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: forwardRef(() => NumberValueAccessor),
		multi: true
	}]
})
export class NumberValueAccessor implements ControlValueAccessor {
	onChange = (_: any) => {}; // tslint:disable-line:no-empty
	onTouched = () => {}; // tslint:disable-line:no-empty

	constructor(private _renderer: Renderer2, private _elementRef: ElementRef) {}

	writeValue(value: number): void {
		// The value needs to be normalized for IE9, otherwise it is set to 'null' when null
		const normalizedValue = value == null ? "" : value;
		this._renderer.setProperty(this._elementRef.nativeElement, "value", normalizedValue);
	}

	registerOnChange(fn: (_: number|null) => void): void {
		this.onChange = (value) => { fn(value === "" ? null : parseFloat(value)); };
	}
	registerOnTouched(fn: () => void): void { this.onTouched = fn; }

	setDisabledState(isDisabled: boolean): void {
		this._renderer.setProperty(this._elementRef.nativeElement, "disabled", isDisabled);
	}
}



export const BUILTIN_ACCESSORS = [
	NumberValueAccessor
];

export function selectValueAccessor(valueAccessors: ControlValueAccessor[] | undefined): ControlValueAccessor | undefined {
	if (!valueAccessors) {
		return undefined;
	}

	let defaultAccessor: ControlValueAccessor | undefined,
		builtinAccessor: ControlValueAccessor | undefined,
		customAccessor: ControlValueAccessor | undefined;

	valueAccessors.forEach((v) => {
		if (v.constructor === DefaultValueAccessor) {
			defaultAccessor = v;
		} else if (!!~BUILTIN_ACCESSORS.indexOf(v.constructor as any)) {
			builtinAccessor = v;
		} else {
			customAccessor = v;
		}
	});

	if (customAccessor != null) {
		return customAccessor;
	}
	if (builtinAccessor != null) {
		return builtinAccessor;
	}
	if (defaultAccessor != null) {
		return defaultAccessor;
	}

	return undefined;
}
