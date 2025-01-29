import path from "path-browserify";

export const assetsDirPath = "./assets";

export const vaultMetadataFilePath = path.join(
	assetsDirPath,
	"metadata",
	"vault.json",
);

export const notesDirPath = "notes";
export const withAssetsDirPath = path.join(assetsDirPath, notesDirPath);

export const bookmarkFilePath = path.join(
	assetsDirPath,
	"metadata",
	"bookmarks.json",
);

export const blogDirPath = "blog";
