import { Component, DebugElement, ElementRef, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { Validator } from "@lchemy/model/validation";
import { FormFieldDirective } from "../src/form-field.directive";
import { FormComponent } from "../src/form.component";
import { FormsModule } from "../src/forms.module";

import { User, userValidator } from "./fixtures/user";

describe("FormFieldDirective", () => {
	let fixture: ComponentFixture<FormWithFieldsTestComponent>,
		fixtureComponent: FormWithFieldsTestComponent,
		formComponent: FormComponent<User>,
		nameInputDirective: FormFieldDirective<User, string>,
		nameInputElem: HTMLInputElement,
		emailInputDirective: FormFieldDirective<User, string>,
		advance: (n?: number) => void;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				FormsModule
			],
			declarations: [
				FormWithFieldsTestComponent
			]
		});

		TestBed.compileComponents();

		fixture = TestBed.createComponent(FormWithFieldsTestComponent);
		fixtureComponent = fixture.componentInstance;

		let formDebugElem: DebugElement = fixture.debugElement.query(By.directive(FormComponent));
		formComponent = formDebugElem.componentInstance;

		nameInputElem = fixtureComponent.nameInput.nativeElement;
		nameInputDirective = fixtureComponent.nameInputField;

		emailInputDirective = fixtureComponent.emailInputField;

		advance = (n) => {
			fixture.detectChanges();
			tick(n);
		};
	});

	it("should trigger validation on input change", fakeAsync(() => {
		advance();
		expect(formComponent.validating).toBe(false);
		expect(nameInputDirective.invalid).toBe(true);
		expect(nameInputDirective.dirty).toBe(false);
		expect(emailInputDirective.invalid).toBe(true);
		expect(emailInputDirective.dirty).toBe(false);

		nameInputElem.value = "test";
		nameInputElem.dispatchEvent(new Event("input"));
		expect(nameInputDirective.dirty).toBe(true);

		// detect changes triggers the doCheck
		fixture.detectChanges();
		expect(formComponent.validating).toBe(true);

		tick();
		expect(nameInputDirective.invalid).toBe(false);
	}));

	it("should update its container's states", fakeAsync(() => {
		advance();

		nameInputElem.dispatchEvent(new Event("input"));
		nameInputElem.dispatchEvent(new FocusEvent("blur"));
		expect(nameInputDirective.dirty).toBe(true);
		expect(nameInputDirective.touched).toBe(true);
		expect(formComponent.dirty).toBe(true);
		expect(formComponent.touched).toBe(true);
	}));

	xit("should properly get/set from the model when name changes", fakeAsync(() => {
		// TODO
	}));

	xit("should allow name to be defined on lcFormField directly", fakeAsync(() => {
		// TODO
	}));

	xit("should register/unregister from its container", fakeAsync(() => {
		// TODO
	}));

	xit("should create objects to fill up the path if a section is missing", fakeAsync(() => {
		// TODO
	}));

	xit("should apply the right css classes based on the state", fakeAsync(() => {
		// TODO
	}));
});

@Component({
	template: `
		<lc-form [model]="user" [validator]="validator">
			<input type="text" name="id" lcFormField #idInput #idInputField="lcFormField" />
			<input type="text" name="name" lcFormField #nameInput #nameInputField="lcFormField" />
			<input type="text" name="email" lcFormField #emailInput #emailInputField="lcFormField" />
		</lc-form>
	`
})
class FormWithFieldsTestComponent {
	user: User = new User();
	validator: Validator<User> = userValidator;

	@ViewChild("idInput") idInput: ElementRef;
	@ViewChild("idInputField") idInputField: FormFieldDirective<User, string>;

	@ViewChild("nameInput") nameInput: ElementRef;
	@ViewChild("nameInputField") nameInputField: FormFieldDirective<User, string>;

	@ViewChild("emailInput") emailInput: ElementRef;
	@ViewChild("emailInputField") emailInputField: FormFieldDirective<User, string>;
}
