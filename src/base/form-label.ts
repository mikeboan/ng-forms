import { OnDestroy, OnInit } from "@angular/core";
import { Model } from "@lchemy/model";

import { FormContainer } from "./form-container";

export class FormLabel<M extends Model> implements OnInit, OnDestroy {
	get path(): string {
		return this._path;
	}
	set path(value: string) {
		if (this._path === value) {
			return;
		}

		if (this._path != null) {
			this.container.unsetLabel(this._path);
		}
		this._path = value;
		this.container.setLabel(value, this.label);
	}
	private _path: string;



	get label(): string {
		return this._label;
	}
	set label(value: string) {
		if (value === this._label) {
			return;
		}
		this._label = value;
		this.container.setLabel(this.path, value);
	}
	private _label: string;



	constructor(
		protected container: FormContainer<M>
	) {

	}

	ngOnInit(): void {
		this.container.addLabel(this);
	}

	ngOnDestroy(): void {
		this.container.removeLabel(this);
	}
}
