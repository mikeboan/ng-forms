import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { DefaultValueAccessor } from "./common-accessors";
import { FormErrorSummaryComponent } from "./form-error-summary.component";
import { FormErrorDirective } from "./form-error.directive";
import { FormErrorsComponent } from "./form-errors.component";
import { FormFieldLabelDirective } from "./form-field-label.directive";
import { FormFieldDirective } from "./form-field.directive";
import { FormGroupComponent } from "./form-group.component";
import { FormComponent } from "./form.component";

@NgModule({
	imports: [
		CommonModule
	],
	declarations: [
		DefaultValueAccessor,
		FormComponent,
		FormErrorDirective,
		FormErrorSummaryComponent,
		FormErrorsComponent,
		FormFieldDirective,
		FormFieldLabelDirective,
		FormGroupComponent
	],
	exports: [
		DefaultValueAccessor,
		FormComponent,
		FormErrorDirective,
		FormErrorSummaryComponent,
		FormErrorsComponent,
		FormFieldDirective,
		FormFieldLabelDirective,
		FormGroupComponent
	]
})
export class LcFormsModule {

}
