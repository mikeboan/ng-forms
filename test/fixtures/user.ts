import { Model } from "@lchemy/model";
import { Validator, rules } from "@lchemy/model/validation";

export class User extends Model {
	id: number;
	name: string;
	email: string;
}

export const userValidator: Validator<User> = new Validator({
	id: [
		rules.isInt()
	],
	name: [
		rules.required(),
		rules.isString(),
		rules.minLength(3)
	],
	email: [
		rules.required(),
		rules.isString(),
		rules.isEmail()
	]
});
