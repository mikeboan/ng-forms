import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { Validator } from "@lchemy/model/validation";
import { FormComponent } from "../src/form.component";
import { FormsModule } from "../src/forms.module";

import { User, userValidator } from "./fixtures/user";

describe("FormComponent", () => {
	let fixture: ComponentFixture<FormErrorsTestComponent>,
		fixtureComponent: FormErrorsTestComponent,
		formComponent: FormComponent<User>,
		nameErrorsElem: HTMLElement,
		emailErrorsElem: HTMLElement,
		advance: (n?: number) => void;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				FormsModule
			],
			declarations: [
				FormErrorsTestComponent
			]
		});

		TestBed.compileComponents();

		fixture = TestBed.createComponent(FormErrorsTestComponent);
		fixtureComponent = fixture.componentInstance;

		let formDebugElem: DebugElement = fixture.debugElement.query(By.directive(FormComponent));
		formComponent = formDebugElem.componentInstance;

		nameErrorsElem = fixture.debugElement.query(By.css("#name-errors")).nativeElement;
		emailErrorsElem = fixture.debugElement.query(By.css("#email-errors")).nativeElement;

		advance = (n) => {
			fixture.detectChanges();
			tick(n);
			fixture.detectChanges();
		};
	});

	it("should show errors", fakeAsync(() => {
		advance();

		expect(nameErrorsElem.textContent!.trim()).toBe("Value is required.");
		expect(emailErrorsElem.textContent!.trim()).toBe("Value is required.");

		fixtureComponent.user.name = ":O";
		formComponent.validate();
		advance();

		expect(nameErrorsElem.textContent!.trim()).toBe("Value must be at least 3 characters long.");
	}));

	xit("should handle dynamic names", fakeAsync(() => {
		// TODO
	}));

	xit("should apply the right css classes based on the state", fakeAsync(() => {
		// TODO
	}));
});

@Component({
	template: `
		<lc-form [model]="user" [validator]="validator">
			<lc-form-errors name="name" id="name-errors"></lc-form-errors>
			<lc-form-errors name="email" id="email-errors"></lc-form-errors>
		</lc-form>
	`
})
class FormErrorsTestComponent {
	user: User = new User();
	validator: Validator<User> | undefined = userValidator;
	debounce: number | undefined = undefined;
}
