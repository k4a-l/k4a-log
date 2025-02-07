import { produce } from "immer";
import { describe, expect, test } from "vitest";

import { isContainNGWords, isMatchNodeCondition } from "./check";

describe("isContainNGWords", () => {
	test("TRUE", () => {
		expect(isContainNGWords("hogeNGhoge", ["NG"])).toBe(true);
		expect(
			isContainNGWords(
				String.raw`
            hogehoge 
            NO`,
				["NG", "NO"],
			),
		).toBe(true);

		expect(isContainNGWords("hogeN Ghoge", ["N G"])).toBe(true);
	});

	test("FALSE", () => {
		expect(
			isContainNGWords(
				String.raw`hogeN GhogeN
            GN.O`,
				["NG", "NO"],
			),
		).toBe(false);
	});
});

describe("isPrivateFile", () => {
	const baseData: Parameters<typeof isMatchNodeCondition>[0] = {
		basename: "タイトル",
		path: "/path/to/file",
		metadata: { tags: [], frontmatter: {} },
	};
	describe("TAG", () => {
		test("TRUE", () => {
			expect(
				isMatchNodeCondition(
					produce(baseData, (draft) => {
						draft.metadata.tags = [
							{ tag: "value0" },
							{ tag: "private" },
							{ tag: "value1" },
						];
					}),
					{ tags: ["cond0", "private", "cond1"] },
				),
			).toBe(true);
		});

		test("FALSE", () => {
			expect(
				isMatchNodeCondition(
					produce(baseData, (draft) => {
						draft.metadata.tags = [
							{ tag: "value0" },
							{ tag: "private_" },
							{ tag: "value1" },
						];
					}),
					{ tags: ["cond0", "private", "private__"] },
				),
			).toBe(false);
		});
	});

	describe("TITLE", () => {
		test("TRUE", () => {
			expect(
				isMatchNodeCondition(
					produce(baseData, (draft) => {
						draft.basename = "ti🔐tle";
					}),
					{ titles: ["🔐"] },
				),
			).toBe(true);
		});

		test("FALSE", () => {
			expect(
				isMatchNodeCondition(
					produce(baseData, (draft) => {
						draft.basename = "ti🔐 🔐tle";
					}),
					{ titles: ["🔐🔐"] },
				),
			).toBe(false);
		});
	});

	describe("PATH", () => {
		test("TRUE", () => {
			expect(
				isMatchNodeCondition(
					produce(baseData, (draft) => {
						draft.path = "/private/path/to/file";
					}),
					{ paths: ["private"] },
				),
			).toBe(true);
			expect(
				isMatchNodeCondition(
					produce(baseData, (draft) => {
						draft.path = "/private/path/to/file";
					}),
					{ paths: ["/private"] },
				),
			).toBe(true);
		});

		test("FALSE", () => {
			expect(
				isMatchNodeCondition(
					produce(baseData, (draft) => {
						draft.path = "/path/private/to/file";
					}),
					{ paths: ["private"] },
				),
			).toBe(false);
		});
	});

	describe("FRONTMATTER", () => {
		test("TRUE", () => {
			expect(
				isMatchNodeCondition(
					produce(baseData, (draft) => {
						draft.metadata.frontmatter = { publish: false };
					}),
					{ frontmatter: { publish: "false" } },
				),
			).toBe(true);

			expect(
				isMatchNodeCondition(
					produce(baseData, (draft) => {
						draft.metadata.frontmatter = { publish: "false" };
					}),
					{ frontmatter: { publish: "false" } },
				),
			).toBe(true);

			expect(
				isMatchNodeCondition(
					produce(baseData, (draft) => {
						draft.metadata.frontmatter = { publish: [false] };
					}),
					{ frontmatter: { publish: ["false"] } },
				),
			).toBe(true);
		});

		test("FALSE", () => {
			expect(
				isMatchNodeCondition(
					produce(baseData, (draft) => {
						draft.metadata.frontmatter = { publish: undefined };
					}),
					{ frontmatter: { publish: "false" } },
				),
			).toBe(false);

			expect(
				isMatchNodeCondition(
					produce(baseData, (draft) => {
						draft.metadata.frontmatter = { publish: "false_" };
					}),
					{ frontmatter: { publish: "false" } },
				),
			).toBe(false);

			expect(
				isMatchNodeCondition(
					produce(baseData, (draft) => {
						draft.metadata.frontmatter = {};
					}),
					{ frontmatter: { publish: "false" } },
				),
			).toBe(false);
		});
	});
});
