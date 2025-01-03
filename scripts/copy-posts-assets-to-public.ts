// assets配下のmd以外のファイルをpublicにコピーする
// 実行方法: deno run --allow-read --allow-write scripts/copy-posts-assets-to-public.ts

import fs from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const assetsPath = join(rootDir, "assets", "posts");
const publicPath = join(rootDir, "public", "posts");

// delete below file of /public/assets
const deleteExistsFile = () => {
	fs.rmSync(publicPath, { recursive: true, force: true });
};

// copy files without '.md' extension and ignore '.obsidian' directory from './assets/posts' to /public/assets
// Preserve file and directory structure and recursively copy to deeper levels
const copyFiles = (srcPath: string, destPath: string) => {
	// srcPath配下のファイルを読み込む
	// ディレクトリだった場合は、再帰的に処理する
	// ファイルだった場合は、ディレクトリ階層を保持してdestPath配下にコピーする

	const files = fs.readdirSync(srcPath, { withFileTypes: true });
	for (const file of files) {
		const srcFullPath = join(srcPath, file.name);
		const destFullPath = join(destPath, file.name);
		if (file.isDirectory()) {
			// ディレクトリだった場合は、再帰的に処理する
			// .obsidianファイルは無視する
			if (file.name === ".obsidian") continue;
			fs.mkdirSync(destFullPath, { recursive: true });
			copyFiles(srcFullPath, destFullPath);
		} else if (file.name.endsWith(".md") === false) {
			// ファイルだった場合は、ディレクトリ階層を保持してdestPath配下にコピーする
			fs.copyFileSync(srcFullPath, destFullPath);
		}
	}
};

deleteExistsFile();
copyFiles(assetsPath, publicPath);
