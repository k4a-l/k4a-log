// biome-ignore lint/style/useNodejsImportProtocol: <explanation> なんかここだけnode:をつけるとwebpackエラーが出る
import { readFileSync } from "fs";

import {
	bookmarkFilePath,
	folderFilePath,
	vaultMetadataFilePath,
} from "@/features/metadata/constant";
import type { Folder } from "scripts/generate/folder";

import type { BookMarkRoot } from "@/components/Bookmark";
import type { TVault } from "@/features/metadata/type";

export const getVaultObject = (): TVault => {
	try {
		const start = performance.now();
		const vaultFileContent = readFileSync(vaultMetadataFilePath, {
			encoding: "utf-8",
		});
		console.log("readFileSync", performance.now() - start);

		const vaultObject: TVault = JSON.parse(vaultFileContent);
		console.log("parse", performance.now() - start);

		return vaultObject;
	} catch (error) {
		console.error("vaultMetadataFilePathの取得でエラー", error);
		return { notes: [], assets: [], pathMap: {}, createdMap: {} };
	}
};

export const getBookmarkObject = (): BookMarkRoot => {
	try {
		const bookmarkFileContent = readFileSync(bookmarkFilePath, {
			encoding: "utf-8",
		});
		const bookmarkObject: BookMarkRoot = JSON.parse(bookmarkFileContent);
		return bookmarkObject;
	} catch (error) {
		console.error("bookmarkFilePathの取得でエラー", error);
		return { items: [] };
	}
};

export const getFolderObject = (): Folder[] => {
	try {
		const content = readFileSync(folderFilePath, {
			encoding: "utf-8",
		});
		const object: Folder[] = JSON.parse(content);
		return object;
	} catch (error) {
		console.error("folderFilePathの取得でエラー", error);
		return [];
	}
};
