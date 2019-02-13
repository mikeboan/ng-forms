import { Component, DebugElement, ElementRef, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { Validator } from "@lchemy/model/validation";
import { FormGroupComponent } from "../src/form-group.component";
import { FormComponent } from "../src/form.component";
import { FormsModule } from "../src/forms.module";

import { User, userValidator } from "./fixtures/user";

describe("FormGroupComponent", () => {
	let fixture: ComponentFixture<FormWithGroupsTestComponent>,
		fixtureComponent: FormWithGroupsTestComponent,
		formComponent: FormComponent<User>,
		formGroupComponent: FormGroupComponent<User>,
		friendNameInputElem: HTMLInputElement,
		advance: (n?: number) => void;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				FormsModule
			],
			declarations: [
				FormWithGroupsTestComponent
			]
		});

		TestBed.compileComponents();

		fixture = TestBed.createComponent(FormWithGroupsTestComponent);
		fixtureComponent = fixture.componentInstance;

		let formDebugElem: DebugElement = fixture.debugElement.query(By.directive(FormComponent));
		formComponent = formDebugElem.componentInstance;

		let formGroupDebugElem: DebugElement = fixture.debugElement.query(By.directive(FormGroupComponent));
		formGroupComponent = formGroupDebugElem.componentInstance;

		friendNameInputElem = fixtureComponent.friendNameInput.nativeElement;

		advance = (n) => {
			fixture.detectChanges();
			tick(n);
		};
	});

	it("should update parent validation state", fakeAsync(() => {
		// valid inputs, expect not invalid, dirty, or touched
		fixtureComponent.user.name = "test";
		fixtureComponent.user.email = "test@lchemy";
		fixtureComponent.friend.name = "quiz";
		fixtureComponent.friend.email = "quiz@lchemy";
		advance();

		expect(formComponent.invalid).toBe(false);
		expect(formGroupComponent.dirty).toBe(false);
		expect(formGroupComponent.touched).toBe(false);
		expect(formGroupComponent.invalid).toBe(false);
		expect(formGroupComponent.dirty).toBe(false);
		expect(formGroupComponent.touched).toBe(false);

		// put invalid input in child form group's field
		friendNameInputElem.value = ":(";
		friendNameInputElem.dispatchEvent(new Event("input"));
		friendNameInputElem.dispatchEvent(new FocusEvent("blur"));
		advance();

		expect(formComponent.invalid).toBe(true);
		expect(formGroupComponent.dirty).toBe(true);
		expect(formGroupComponent.touched).toBe(true);
		expect(formGroupComponent.invalid).toBe(true);
		expect(formGroupComponent.dirty).toBe(true);
		expect(formGroupComponent.touched).toBe(true);

		// fix invalid inputs
		friendNameInputElem.value = "quiz";
		friendNameInputElem.dispatchEvent(new Event("input"));
		friendNameInputElem.dispatchEvent(new FocusEvent("blur"));
		advance();

		expect(formComponent.invalid).toBe(false);
		expect(formGroupComponent.invalid).toBe(false);
	}));

	xit("should register/unregister from its container", fakeAsync(() => {
		// TODO
	}));

	xit("should apply the right css classes based on the state", fakeAsync(() => {
		// TODO
	}));
});

@Component({
	template: `
		<lc-form [model]="user" [validator]="validator">
			<input type="text" name="name" lcFormField #nameInput />
			<input type="text" name="email" lcFormField #emailInput />

			<lc-form-group [model]="friend" [validator]="validator">
				<input type="text" name="name" lcFormField #friendNameInput />
				<input type="text" name="email" lcFormField #friendEmailInput />
			</lc-form-group>
		</lc-form>
	`
})
class FormWithGroupsTestComponent {
	user: User = new User();
	friend: User = new User();
	validator: Validator<User> = userValidator;

	@ViewChild("nameInput")
	nameInput: ElementRef;

	@ViewChild("emailInput")
	emailInput: ElementRef;

	@ViewChild("friendNameInput")
	friendNameInput: ElementRef;

	@ViewChild("friendEmailInput")
	friendEmailInput: ElementRef;
}
