"use server";

import { readFile } from "node:fs/promises";
import { vaultMetadataFilePath } from "@/features/metadata/constant";
import type { TVault } from "@/features/metadata/type";

export const getVaultObject = async (): Promise<TVault> => {
	// metadataの取得
	// TODO: エラーハンドリンク
	const vaultFileContent = await readFile(vaultMetadataFilePath, {
		encoding: "utf-8",
	});
	const vaultObject: TVault = JSON.parse(vaultFileContent);

	return vaultObject;
};
