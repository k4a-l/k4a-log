import path from "path-browserify";

import { IS_PRODUCTION } from "./env";

import type { TNoteIndependence, TTagMetaData } from "@/features/metadata/type";

/**
 * @see {@link normalizePath}
 */
export const isSamePath = (path1: string, path2: string): boolean => {
	return normalizePath(path1) === normalizePath(path2);
};

/**
 * \\,\,/の違いを吸収
 * .mdつきと拡張子無しを同一視
 * 末尾/を削除
 */
export const normalizePath = (str: string): string => {
	return path.join("/", str.replace(/\.md/, "").replace(/\\\\|\\/g, "/"));

	// path
	// 	.join(
	// 		"/",
	// 		str
	// 			// .replace(/\\\\|\\/g, "/")
	// 			// .replace(/\\/g, "/")
	// 			.replace(/\.md/, ""),
	// 	)
	// 	.replace(/\\\\|\\/g, "/")
	// 	.replace(/\\/g, "/")
	// 	.replace(/\/$/, ""),
};

/**
 * file.md => [file, md]
 * file => [file,undefined]
 */
export const dividePathAndExtension = (
	str: string,
): [string, string | undefined] => {
	const [baseName, extension] = str.split(".");
	return [baseName ?? str, extension];
};

/**
 * true: file.png, file.jpg, ..., file.??
 * false: file.md, file
 */
export const hasExtensionButNotMD = (str: string): boolean => {
	return /^(?!.*\.md$).*?\.[^.]+$/.test(str);
};

const isTestDirPath = (str: string): boolean => {
	return str.startsWith(normalizePath(path.join("/", "test")));
};

const isTemplateDirPath = (str: string): boolean => {
	return str.startsWith(normalizePath(path.join("/", "template")));
};

const hasDraftTag = (tags: TTagMetaData[]): boolean => {
	return tags.some((t) => t.tag === "draft");
};

export const isTestOnlyNote = (note: TNoteIndependence): boolean => {
	if (!IS_PRODUCTION) return false;
	return (
		hasDraftTag(note.metadata.tags) ||
		isTestDirPath(note.path) ||
		isTemplateDirPath(note.path)
	);
};

export const pathSplit = (str: string): string[] =>
	normalizePath(str)
		?.split("/")
		.filter((s) => s) ?? [];

export const safeDecodeURIComponent = (str: string) => {
	try {
		return decodeURIComponent(str);
	} catch (error) {
		return str;
	}
};
