import path from "path-browserify";

import { pathSplit } from "@/utils/path";

export const assetsDirPath = "assets";

export const vaultMetadataFilePath = path.join(
	assetsDirPath,
	"metadata",
	"vault.json",
);

export const notesDirPath = "notes";
export const withAssetsDirPath = path.join(assetsDirPath, notesDirPath);

export const toNoteHref = (...str: string[]) =>
	path.join(
		"/",
		notesDirPath,
		...str.flatMap((s) => {
			return pathSplit(s).map((p) =>
				encodeURIComponent(p).replace(encodeURIComponent("#"), "#"),
			);
		}),
	);

export const bookmarkFilePath = path.join(
	assetsDirPath,
	"metadata",
	"bookmarks.json",
);
export const folderFilePath = path.join(
	assetsDirPath,
	"metadata",
	"folders.json",
);

export const blogDirPath = "blog";

export const workDirPath = "work";
