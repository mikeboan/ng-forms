import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { DefaultValueAccessor } from "./common-accessors";
import { FormErrorDirective } from "./form-error.directive";
import { FormErrorsComponent } from "./form-errors.component";
import { FormFieldDirective } from "./form-field.directive";
import { FormGroupComponent } from "./form-group.component";
import { FormLabelDirective } from "./form-label.directive";
import { FormSummaryComponent } from "./form-summary.component";
import { FormComponent } from "./form.component";

@NgModule({
	imports: [
		CommonModule
	],
	declarations: [
		DefaultValueAccessor,
		FormComponent,
		FormErrorDirective,
		FormErrorsComponent,
		FormFieldDirective,
		FormGroupComponent,
		FormLabelDirective,
		FormSummaryComponent
	],
	exports: [
		DefaultValueAccessor,
		FormComponent,
		FormErrorDirective,
		FormErrorsComponent,
		FormFieldDirective,
		FormGroupComponent,
		FormLabelDirective,
		FormSummaryComponent
	]
})
export class FormsModule {

}
