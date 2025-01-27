import { postDirPath } from "@/constants/path";
import path from "path-browserify";

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
	return decodeURIComponent(
		path
			.join(
				"/",
				str.replace(/\\\\/g, "/").replace(/\\/g, "/").replace(/\.md/, ""),
			)
			.replace(/\/$/, ""),
	);
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

export const isTestDirPath = (str: string): boolean => {
	return str.startsWith(normalizePath(path.join(postDirPath, "test")));
};
