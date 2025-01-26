import { copyFileSync } from "node:fs";
import path from "node:path";

import {
	bookmarkFilePath,
	withAssetsDirPath,
} from "@/features/metadata/constant";

const bookmarkFilePathOfObsidian = path.join(
	path.resolve(),
	withAssetsDirPath,
	".obsidian",
	"bookmarks.json",
);

const main = async () => {
	await copyFileSync(bookmarkFilePathOfObsidian, bookmarkFilePath);
};

const [funcName] = process.argv.slice(2);
if (funcName === "main") main();
