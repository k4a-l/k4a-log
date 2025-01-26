import path from "path-browserify";

export const assetsDirPath = "./assets";

export const vaultMetadataFilePath = path.join(
	assetsDirPath,
	"metadata",
	"vault.json",
);

export const postsDirPath = "posts";
export const withAssetsDirPath = path.join(assetsDirPath, postsDirPath);

export const bookmarkFilePath = path.join(
	assetsDirPath,
	"metadata",
	"bookmarks.json",
);
