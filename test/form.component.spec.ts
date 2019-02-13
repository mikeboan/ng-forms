import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { Validator } from "@lchemy/model/validation";
import { FormComponent } from "../src/form.component";
import { FormsModule } from "../src/forms.module";
import { User, userValidator } from "./fixtures/user";

describe("FormComponent", () => {
	let fixture: ComponentFixture<FormTestComponent>,
		fixtureComponent: FormTestComponent,
		formComponent: FormComponent<User>,
		formElem: HTMLElement,
		advance: (n?: number) => void;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				FormsModule
			],
			declarations: [
				FormTestComponent
			]
		});

		TestBed.compileComponents();

		fixture = TestBed.createComponent(FormTestComponent);
		fixtureComponent = fixture.componentInstance;

		let formDebugElem: DebugElement = fixture.debugElement.query(By.directive(FormComponent));
		formComponent = formDebugElem.componentInstance;
		formElem = formDebugElem.nativeElement;

		advance = (n) => {
			fixture.detectChanges();
			tick(n);
		};
	});

	it("should validate the model", fakeAsync(() => {
		// initializes as pending
		fixture.detectChanges();
		expect(formComponent.state).toBe("PENDING");
		expect(formComponent.validationResult).toBeUndefined();

		// empty user model should be invalid
		advance();
		expect(formComponent.state).toBe("INVALID");
		expect(formComponent.validationResult).toBeDefined();

		expect(formComponent.valid).toBe(false);
		expect(formComponent.invalid).toBe(true);

		// put some properties in it and revalidate, should be valid
		fixtureComponent.user.name = "test";
		fixtureComponent.user.email = "test@lchemy";
		formComponent.validate();
		advance();

		expect(formComponent.state).toBe("VALID");

		expect(formComponent.valid).toBe(true);
		expect(formComponent.invalid).toBe(false);
	}));

	it("should debounce validation", fakeAsync(() => {
		fixtureComponent.debounce = 100;
		advance();

		// trigger validation with debounce, should be pending
		formComponent.validate();
		expect(formComponent.state).toBe("PENDING");
		expect(formComponent.validationResult).toBeUndefined();
		expect(formComponent.validating).toBe(true);

		// step microtasks, should still be pending
		advance();
		expect(formComponent.state).toBe("PENDING");

		// step 100ms, should not be pending
		advance(100);
		expect(formComponent.state).not.toBe("PENDING");

		// trigger validation with debounce, should be pending
		formComponent.validate();
		expect(formComponent.state).toBe("PENDING");

		// step 99ms, should be pending
		advance(99);
		expect(formComponent.state).toBe("PENDING");

		// trigger validation again
		formComponent.validate();

		// step 1ms, should be pending
		advance(1);
		expect(formComponent.state).toBe("PENDING");

		// step 99ms, should not be pending
		advance(99);
		expect(formComponent.state).not.toBe("PENDING");
	}));

	it("should always be valid if no validator", fakeAsync(() => {
		fixtureComponent.validator = undefined;
		advance();

		expect(formComponent.state).toBe("VALID");
	}));

	it("should apply the right css classes based on the state", fakeAsync(() => {
		advance();

		expect(formComponent.untouched).toBe(true);
		expect(formComponent.touched).toBe(false);
		expect(formComponent.pristine).toBe(true);
		expect(formComponent.dirty).toBe(false);
		expect(formComponent.valid).toBe(false);
		expect(formComponent.invalid).toBe(true);
		expect(formComponent.validating).toBe(false);

		expect(formElem.classList.contains("lc-untouched")).toBe(true);
		expect(formElem.classList.contains("lc-touched")).toBe(false);
		expect(formElem.classList.contains("lc-pristine")).toBe(true);
		expect(formElem.classList.contains("lc-dirty")).toBe(false);
		expect(formElem.classList.contains("lc-valid")).toBe(false);
		expect(formElem.classList.contains("lc-invalid")).toBe(true);
		expect(formElem.classList.contains("lc-validating")).toBe(false);

		// mark as dirty, validating
		formComponent.markAsDirty();
		formComponent.validate();

		expect(formComponent.pristine).toBe(false);
		expect(formComponent.dirty).toBe(true);
		expect(formComponent.validating).toBe(true);

		expect(formElem.classList.contains("lc-pristine")).toBe(false);
		expect(formElem.classList.contains("lc-dirty")).toBe(true);
		expect(formElem.classList.contains("lc-validating")).toBe(true);

		advance();

		// put some properties in it and revalidate, should be valid
		fixtureComponent.user.name = "test";
		fixtureComponent.user.email = "test@lchemy";
		formComponent.validate();
		advance();

		expect(formComponent.valid).toBe(true);
		expect(formComponent.invalid).toBe(false);
		expect(formComponent.validating).toBe(false);

		expect(formElem.classList.contains("lc-valid")).toBe(true);
		expect(formElem.classList.contains("lc-invalid")).toBe(false);
		expect(formElem.classList.contains("lc-validating")).toBe(false);
	}));
});

@Component({
	template: `
		<lc-form [model]="user" [validator]="validator" [validationDebounce]="debounce">
		</lc-form>
	`
})
class FormTestComponent {
	user: User = new User();
	validator: Validator<User> | undefined = userValidator;
	debounce: number | undefined = undefined;
}
