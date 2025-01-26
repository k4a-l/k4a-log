import { writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { BookMarkItem, BookMarkRoot } from "@/components/Bookmark";
import {
	bookmarkFilePath,
	withAssetsDirPath,
} from "@/features/metadata/constant";

const insertTestPath = (item: BookMarkItem): BookMarkItem => {
	if (item.type === "file") {
		return {
			...item,
			path: path.join("tests", item.path),
		};
	}
	return {
		...item,
		items: item.items.map(insertTestPath),
	};
};

export const createBookmarkFile = async (): Promise<BookMarkRoot> => {
	const fileContent: BookMarkRoot = JSON.parse(
		await readFile(
			path.join(
				path.resolve(),
				withAssetsDirPath,
				"tests",
				".obsidian",
				"bookmarks.json",
			),
			{
				encoding: "utf-8",
			},
		),
	);

	// fileContentのすべてのpathの頭に'./test'/をつける
	const pathCorrected: BookMarkRoot = {
		items: fileContent.items.map((item) => insertTestPath(item)),
	};

	return pathCorrected;
};

const main = async () => {
	const bookmark = await createBookmarkFile();
	await writeFileSync(bookmarkFilePath, JSON.stringify(bookmark));
};

const [funcName] = process.argv.slice(2);
if (funcName === "main") main();
