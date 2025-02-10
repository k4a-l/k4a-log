// assets配下のmd以外のファイルをpublicにコピーする

import fs from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { getVaultObject } from "@/features/file/io";
import { assetsDirPath, notesDirPath } from "@/features/metadata/constant";
import { IS_PRODUCTION } from "@/utils/env";
import { hasExtensionButNotMD, isSamePath, normalizePath } from "@/utils/path";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const assetsPath = join(rootDir, "assets", notesDirPath);
const publicPath = join(rootDir, "public", notesDirPath);

// delete below file of /public/assets
const deleteExistsFile = () => {
	fs.rmSync(publicPath, { recursive: true, force: true });
};

// copy files without '.md' extension and ignore '.obsidian' directory from './assets' to /public/assets
// Preserve file and directory structure and recursively copy to deeper levels
const copyFiles = (srcPath: string, destPath: string) => {
	const vault = getVaultObject();
	const allAssetPathList: string[] = vault.notes.flatMap((n) => [
		...[...n.metadata.links, ...n.metadata.embeds]
			.map((n) => n.path)
			.filter((p) => hasExtensionButNotMD(p)),
		...(n.thumbnailPath ? [n.thumbnailPath] : []),
	]);

	// srcPath配下のファイルを読み込む
	// ディレクトリだった場合は、再帰的に処理する
	// ファイルだった場合は、ディレクトリ階層を保持してdestPath配下にコピーする

	const files = fs.readdirSync(srcPath, { withFileTypes: true });
	for (const file of files) {
		const srcFullPath = join(srcPath, file.name);
		const destFullPath = join(destPath, file.name);

		if (file.name.startsWith(".")) continue;

		if (file.isDirectory()) {
			// ディレクトリだった場合は、再帰的に処理する
			// .obsidianファイルは無視する
			if (file.name === ".obsidian") continue;
			fs.mkdirSync(destFullPath, { recursive: true });
			copyFiles(srcFullPath, destFullPath);
		} else if (file.name.endsWith(".md") === false) {
			// ファイルだった場合は、ディレクトリ階層を保持してdestPath配下にコピーする

			// 使われてなければコピーしない（プライベートの場合も使われない判定）
			const relativePath = normalizePath(
				srcFullPath.split(assetsDirPath)[1] ?? "",
			);
			const isUsed = allAssetPathList.some((p) =>
				isSamePath(p, relativePath.replace("/notes", "")),
			);

			if (isUsed) {
				fs.copyFileSync(srcFullPath, destFullPath);
			} else {
				// loggingWithColor("yellow", `NOT COPIED >> ${srcFullPath}`);
			}
			if (IS_PRODUCTION) {
				fs.rmSync(srcFullPath, { recursive: true, force: true });
			}
		}
	}
};

deleteExistsFile();
copyFiles(assetsPath, publicPath);
