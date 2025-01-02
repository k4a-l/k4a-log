import { describe, expect, test } from "vitest";
import { type FileTree, getFileTree } from "./util";

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
		children: [{ type: "file", name: "ディレクトリ配下.md" }],
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
	{ type: "file", name: "スペース「 」「　」・記号込.md" },
];

describe("pathResolver", () => {
	test("", () => {});
	//   render(<Page />)
	//   expect(screen.getByRole('heading', { level: 1, name: 'Home' })).toBeDefined()
});

test("ファイル一覧取得", () => {
	const directoryPath = "./assets/tests/posts";
	const directoryTree = getFileTree(directoryPath);
	expect(directoryTree).toStrictEqual(TEST_FILE_TREE);
});
