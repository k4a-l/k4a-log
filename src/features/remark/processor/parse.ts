import wikiLinkPlugin from "@/features/remark/wikilink";
import type { WikiLinkOption } from "@/features/remark/wikilink/type";
import type { FileTree } from "@/features/remark/wikilink/util";
import type { Root } from "mdast";
import { remark } from "remark";
import remarkParse from "remark-parse";
import type { Processor } from "unified";

import remarkFrontmatter, {
	type Options as RemarkFrontmatterOptions,
} from "remark-frontmatter";

import {} from "remark-extract-frontmatter";

import remarkGfm from "remark-gfm";

export const createParseProcessor = (
	fileTrees: FileTree[],
	_parentsLinks: string[],
): Processor<Root, undefined, undefined, Root, string> => {
	const parentsLinks = _parentsLinks
		.map((p) => decodeURIComponent(p))
		.map((p) =>
			p
				.replace(/\\+/g, "/")
				.replace(/.md$/, "")
				.replace(/#([^.]*)/, ""),
		);

	const processor = remark()
		.use(remarkParse)
		.use(remarkGfm)
		.use(wikiLinkPlugin, {
			fileTrees,
			assetPath: "assets",
			rootPath: "posts",
			parentsLinks,
		} satisfies WikiLinkOption)
		.use(remarkFrontmatter, [
			{
				type: "yaml",
				marker: "-",
			},
		] satisfies RemarkFrontmatterOptions);

	return processor;
};
