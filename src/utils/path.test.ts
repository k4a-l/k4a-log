import { expect, test } from "vitest";
import { hasExtensionButNotMD, normalizePath } from "./path";

test("normalizePath", () => {
	const normalized = "/path/to/file";
	expect(normalizePath("/path/to/file/")).toBe(normalized);
	expect(normalizePath("path/to/file")).toBe(normalized);
	expect(normalizePath("/path\\to\\file")).toBe(normalized);
});

test("isNotMDFile", () => {
	expect(hasExtensionButNotMD("/path/to/file.png")).toBe(true);
	expect(hasExtensionButNotMD("path/to/file")).toBe(false);
	expect(hasExtensionButNotMD("/path\\to\\some.md")).toBe(false);
});
