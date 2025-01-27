"use server";

import { readFile } from "node:fs/promises";
import type { BookMarkRoot } from "@/components/Bookmark";
import {
	bookmarkFilePath,
	vaultMetadataFilePath,
} from "@/features/metadata/constant";
import type { TVault } from "@/features/metadata/type";

export const getVaultObject = async (): Promise<TVault> => {
	// TODO: エラーハンドリンク
	try {
		// metadataの取得
		// TODO: エラーハンドリンク
		const vaultFileContent = await readFile(vaultMetadataFilePath, {
			encoding: "utf-8",
		});
		const vaultObject: TVault = JSON.parse(vaultFileContent);

		return vaultObject;
	} catch (error) {
		console.error("vaultMetadataFilePathの取得でエラー", error);
		return { posts: [], pathMap: {}, createdMap: {} };
	}
};

export const getBookmarkObject = async (): Promise<BookMarkRoot> => {
	// metadataの取得
	// TODO: エラーハンドリンク
	try {
		const bookmarkFileContent = await readFile(bookmarkFilePath, {
			encoding: "utf-8",
		});
		const bookmarkObject: BookMarkRoot = JSON.parse(bookmarkFileContent);
		return bookmarkObject;
	} catch (error) {
		console.error("bookmarkFilePathの取得でエラー", error);
		return { items: [] };
	}
};
