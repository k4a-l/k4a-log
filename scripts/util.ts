import path from "node:path";

import { notesDirPath } from "@/features/metadata/constant";
import {
	type FileTree,
	imageExtensions,
	pathResolver,
} from "@/features/remark/wikilink/util";
import { normalizePath, pathSplit } from "@/utils/path";
import { shell_color, shell_color_reset } from "scripts/constants";

import type { TNoteMetaData } from "@/features/metadata/type";
import type { VFileData } from "@/features/remark/frontmatter";

/**
 * [["str"]] => "str"
 * それ以外はundefined
 */
export const pickWikilinkLikeArrayStr = (
	input: unknown,
): string | undefined => {
	if (typeof input !== "string") return undefined;

	const r = input.match(/(\[\[.*?\]\])/);
	if (r) {
		return r[1]?.slice(2, -2);
	}

	return undefined;
};

export const getThumbnailPath = (
	file: {
		path: string;
		frontmatter: VFileData["frontmatter"];
	},
	metadata: TNoteMetaData,
	fileTrees: FileTree[],
): string | undefined => {
	const thumbnailWikilinkPath = pickWikilinkLikeArrayStr(
		file.frontmatter?.thumbnailPath,
	);

	if (thumbnailWikilinkPath) {
		const result = pathResolver({
			linkName: thumbnailWikilinkPath,
			currentPaths: pathSplit(file.path),
			fileTrees,
		});

		if (result) return path.join("/", notesDirPath, normalizePath(result));
	}

	const thumbnailPath = [...metadata.embeds, ...metadata.links]
		.sort((a, b) => {
			if (!a.position && b.position) return 0;
			if (!a.position) return 1;
			if (!b.position) return -1;
			if (a.position?.start.line < b.position?.start.line) {
				return -1;
			}
			if (a.position.start.line > b.position?.start.line) {
				return 1;
			}
			if (a.position.start.column < b.position?.start.column) {
				return -1;
			}
			return 0;
		})
		.find((e) => imageExtensions.some((r) => e.path.match(r)))?.path;

	if (thumbnailPath) return thumbnailPath;

	return undefined;
};

export const loggingWithColor = (
	color: keyof typeof shell_color,
	...args: Parameters<typeof console.log>
) => {
	console.log(`${shell_color[color]}`, ...args, shell_color_reset);
};
