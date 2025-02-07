import { expect, test } from "vitest";

import { notesDirPath } from "@/features/metadata/constant";

import { type FileTree, createFileTrees } from "./util";

const TEST_FILE_TREE: FileTree[] = [
	{
		type: "dir",
		name: "attachments",
		children: [
			{ type: "file", name: "BMP.bmp" },
			{ type: "file", name: "GIF.gif" },
			{ type: "file", name: "JPG.jpg" },
			{ type: "file", name: "MP4.mp4" },
			{ type: "file", name: "PDF.pdf" },
			{ type: "file", name: "PNG.png" },
			{ type: "file", name: "TEXT.png" },
		],
	},
	{
		type: "dir",
		name: "directory",
		children: [
			{
				type: "dir",
				name: "directory2",
				children: [{ type: "file", name: "ディレクトリ配下.md" }],
			},
			{ type: "file", name: "ディレクトリ配下.md" },
		],
	},
	{ type: "file", name: "INDEX.md" },
	{
		type: "dir",
		name: "SYNTAX TEST",
		children: [
			{ type: "file", name: "COMMON.md" },
			{ type: "file", name: "ORIGINAL.md" },
		],
	},
	{
		type: "dir",
		name: "withDate",
		children: [
			{ type: "file", name: "2011-12-31.md" },
			{ type: "file", name: "2023-06-23.md" },
			{ type: "file", name: "2025-01-11.md" },
			{ type: "file", name: "2025-01-12.md" },
		],
	},
	{ type: "file", name: "スペース「 」「　」・記号込.md" },
];

// describe("直近パス検索", () => {
// 	test("ルートから下方向のみ", () => {
// 		const result = findClosest(TEST_FILE_TREE, ["INDEX"], "ディレクトリ配下");
// 		expect(result?.absPaths).toStrictEqual([
// 			"directory",
// 			"ディレクトリ配下.md",
// 		]);
// 	});

// 	test("ルートから遠いパス形式", () => {
// 		const result = findClosest(
// 			TEST_FILE_TREE,
// 			["INDEX"],
// 			"directory/directory2/ディレクトリ配下",
// 		);
// 		expect(result?.absPaths).toStrictEqual([
// 			"directory",
// 			"directory2",
// 			"ディレクトリ配下.md",
// 		]);
// 	});

// 	test("上方向も含めた直近検索", () => {
// 		const result = findClosest(
// 			TEST_FILE_TREE,
// 			["SYNTAX TEST", "COMMON"],
// 			"ディレクトリ配下",
// 		);
// 		expect(result?.absPaths).toStrictEqual([
// 			"directory",
// 			"ディレクトリ配下.md",
// 		]);
// 	});

// 	test("上方向も含めた遠いパス形式", () => {
// 		const result = findClosest(
// 			TEST_FILE_TREE,
// 			["SYNTAX TEST", "COMMON"],
// 			"../directory/directory2/ディレクトリ配下",
// 		);
// 		expect(result?.absPaths).toStrictEqual([
// 			"directory",
// 			"directory2",
// 			"ディレクトリ配下.md",
// 		]);
// 	});

// 	test("エンコード", () => {
// 		const result = findClosest(
// 			TEST_FILE_TREE,
// 			["SYNTAX TEST", "COMMON"],
// 			encodeURIComponent("スペース「 」「　」・記号込"),
// 		);
// 		expect(result?.absPaths).toStrictEqual(["スペース「 」「　」・記号込.md"]);
// 	});
// });

test("ファイル一覧取得", () => {
	const directoryPath = `./assets/${notesDirPath}/tests`;
	const fileTree = createFileTrees(directoryPath);
	expect(fileTree).toStrictEqual(TEST_FILE_TREE);
});
