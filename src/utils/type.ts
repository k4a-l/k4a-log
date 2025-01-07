export type FindFromUnion<
	Target extends {},
	KeyProp extends keyof Target,
	Key extends Target[KeyProp],
> = Target extends { [x in KeyProp]: Key } ? Target : never;

export class ExhaustiveError extends Error {
	constructor(value: never, message = `未対応値: ${value}`) {
		super(message);
	}
}
