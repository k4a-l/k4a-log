import { remark } from "remark";
import remarkFrontmatter, {
	type Options as RemarkFrontmatterOptions,
} from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";

import { assetsDirPath } from "@/features/metadata/constant";
import wikiLinkPlugin from "@/features/remark/wikilink";

import type { WikiLinkOption } from "@/features/remark/wikilink/type";
import type { FileNode } from "@/features/remark/wikilink/util";
import type { Root } from "mdast";
import type { Processor } from "unified";

import { normalizePath, safeDecodeURIComponent } from "@/utils/path";
import type { PathMap } from "@/features/metadata/type";
import path from "path-browserify";

export const createParseProcessor = (
	_parentsLinks: string[],
	notes: FileNode[],
	pathMap: PathMap,
): Processor<Root, undefined, undefined, Root, string> => {
	const parentsLinks = _parentsLinks
		.map((p) => safeDecodeURIComponent(p))
		.map((p) =>
			p
				.replace(/\\+/g, "/")
				.replace(/.md$/, "")
				.replace(/#([^.]*)/, ""),
		);

	const fileMap: Map<string, FileNode> = new Map();
	for (const fileNode of notes) {
		const filePath = normalizePath(path.join(fileNode.absPath));
		fileMap.set(filePath, fileNode);
	}

	const processor = remark()
		.use(remarkParse)
		.use(remarkGfm)
		.use(wikiLinkPlugin, {
			assetPath: assetsDirPath,
			parentsLinks,
			notes,
			fileMap,
			pathMap,
		} satisfies WikiLinkOption)
		.use(remarkFrontmatter, [
			{
				type: "yaml",
				marker: "-",
			},
		] satisfies RemarkFrontmatterOptions);

	return processor;
};
