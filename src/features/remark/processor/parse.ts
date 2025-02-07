import { remark } from "remark";
import remarkFrontmatter, {
	type Options as RemarkFrontmatterOptions,
} from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";

import { assetsDirPath, notesDirPath } from "@/features/metadata/constant";
import wikiLinkPlugin from "@/features/remark/wikilink";

import type { WikiLinkOption } from "@/features/remark/wikilink/type";
import type { FileNode } from "@/features/remark/wikilink/util";
import type { Root } from "mdast";
import type { Processor } from "unified";

import {} from "remark-extract-frontmatter";
import { normalizePath, safeDecodeURIComponent } from "@/utils/path";

export const createParseProcessor = (
	_parentsLinks: string[],
	notes: FileNode[],
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
		fileMap.set(normalizePath(fileNode.absPath), fileNode);
	}

	const processor = remark()
		.use(remarkParse)
		.use(remarkGfm)
		.use(wikiLinkPlugin, {
			assetPath: assetsDirPath,
			rootPath: notesDirPath,
			parentsLinks,
			notes,
			fileMap,
		} satisfies WikiLinkOption)
		.use(remarkFrontmatter, [
			{
				type: "yaml",
				marker: "-",
			},
		] satisfies RemarkFrontmatterOptions);

	return processor;
};
