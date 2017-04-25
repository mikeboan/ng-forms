/* tslint:disable:directive-class-suffix use-host-property-decorator */

import { Directive, ElementRef, Inject, Optional, Renderer, forwardRef } from "@angular/core";
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
		private _renderer: Renderer,
		private _elementRef: ElementRef,
		@Optional() @Inject(COMPOSITION_BUFFER_MODE) private _compositionMode: boolean
	) {
		if (this._compositionMode == null) {
			this._compositionMode = !_isAndroid();
		}
	}

	writeValue(value: any): void {
		const normalizedValue = value == null ? "" : value;
		this._renderer.setElementProperty(this._elementRef.nativeElement, "value", normalizedValue);
	}

	registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }
	registerOnTouched(fn: () => void): void { this.onTouched = fn; }

	setDisabledState(isDisabled: boolean): void {
		this._renderer.setElementProperty(this._elementRef.nativeElement, "disabled", isDisabled);
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
