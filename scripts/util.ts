import path from "path-browserify";
import {
	type FileNode,
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
	fileNodes: FileNode[],
): string | undefined => {
	const thumbnailWikilinkPath = pickWikilinkLikeArrayStr(
		file.frontmatter?.thumbnailPath,
	);

	const fileMap: Map<string, FileNode> = new Map();
	for (const fileNode of fileNodes) {
		fileMap.set(normalizePath(fileNode.absPath), fileNode);
	}

	if (thumbnailWikilinkPath) {
		const result = pathResolver({
			linkName: thumbnailWikilinkPath,
			currentPaths: pathSplit(file.path),
			fileNodes,
			fileMap,
		});

		if (result) return path.join("/", normalizePath(result));
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
