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
	// TODO: エラーハンドリンク
	try {
		// metadataの取得
		// TODO: エラーハンドリンク
		const vaultFileContent = readFileSync(vaultMetadataFilePath, {
			encoding: "utf-8",
		});
		const vaultObject: TVault = JSON.parse(vaultFileContent);

		return vaultObject;
	} catch (error) {
		console.error("vaultMetadataFilePathの取得でエラー", error);
		return { notes: [], assets: [], pathMap: {}, createdMap: {} };
	}
};

export const getBookmarkObject = (): BookMarkRoot => {
	// metadataの取得
	// TODO: エラーハンドリンク
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
	// metadataの取得
	// TODO: エラーハンドリンク
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
