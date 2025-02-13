import path from "path-browserify";

import { withAssetsDirPath } from "@/features/metadata/constant";
import {
	convertNoExtensionPathToMD,
	lastOfArr,
} from "@/features/remark/wikilink/util";

import { IS_PRODUCTION } from "./env";

import type {
	PathMap,
	TNoteIndependence,
	TTagMetaData,
} from "@/features/metadata/type";

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
	return path
		.join("/", str.replace(/\.md/, "").replace(/\\\\|\\/g, "/"))
		.replace(/\/$/, "");
};

/**
 * file.md => [file, md]
 * file => [file,undefined]
 */
export const dividePathAndExtension = (
	str: string,
): [string, string | undefined] => {
	const splitted = str.split(".");

	if (splitted.length === 0) {
		return ["", undefined];
	}

	if (splitted.length === 1) {
		return [str, undefined];
	}

	const extension = lastOfArr(splitted);
	const baseName = splitted.slice(0, splitted.length - 1).join(".");

	return [baseName, extension];
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

export const convertPathsToLocalMD = (
	paths: string[],
): { fPath: string; header: string | undefined } => {
	const { header, fPath: _fPath } = convertPathsToMD(paths);

	const fPath = path.join(path.resolve(), withAssetsDirPath, _fPath);

	return { fPath, header };
};
export const convertPathsToMD = (
	paths: string[],
): { fPath: string; header: string | undefined } => {
	let header: string | undefined;
	const fPath = path.join(
		...convertNoExtensionPathToMD(paths).map((p) => {
			// ヘッダー付きリンクの整形
			const matched = p.match(/^.+#([^.]*).*$/);
			if (matched) {
				header = matched[1];
				return p.replace(new RegExp(`#${header}`), "");
			}
			return p;
		}),
	);

	return { fPath, header };
};

export const getLinkOrId = (link: string, pathMap: PathMap): string => {
	const pathOrId = pathMap[normalizePath(link)] ?? link;
	return pathOrId;
};
