import { describe, expect, test } from "vitest";
import { splitByHashtag } from "./util";

describe("splitByHashtag", () => {
	test("含まれていない", () => {
		expect(splitByHashtag("なにもなし")).toStrictEqual(["なにもなし"]);
	});
	test("複数", () => {
		expect(splitByHashtag("foo#tag1 bar#tag2")).toStrictEqual([
			"foo",
			"#tag1",
			"bar",
			"#tag2",
		]);
	});
});
