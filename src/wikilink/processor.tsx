import remarkParse from "remark-parse";

import { Hashtag } from "@/components/Hashtag";
import { MarkdownLink } from "@/components/Link";
import { hashTagHandler, remarkHashtagPlugin } from "@/hashtag";
import wikiLinkPlugin from "@/wikilink";
import type { WikiLinkOption } from "@/wikilink/type";
import type { FileTree } from "@/wikilink/util";
import type { ReactElement } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import rehypeRaw from "rehype-raw";
import rehypeReact, { type Options as RehypeReactOptions } from "rehype-react";
import { remark } from "remark";
import remarkBreaks from "remark-breaks";
import remarkRehype, {
	type Options as remarkRehypeOptions,
} from "remark-rehype";
import type { Processor } from "unified";

export const createProcessor = (
	fileTrees: FileTree[],
	_parentsLinks: string[],
): Processor<undefined, undefined, undefined, undefined, ReactElement> => {
	const parentsLinks = _parentsLinks
		.map((p) => decodeURIComponent(p))
		.map((p) => p.replace(/\\+/g, "/").replace(/.md$/, ""));

	const processor = remark()
		.use(remarkParse)
		.use(wikiLinkPlugin, {
			fileTrees,
			assetPath: "assets",
			rootPath: "posts",
			parentsLinks,
		} satisfies WikiLinkOption)
		.use(remarkHashtagPlugin)
		.use(remarkBreaks)
		.use(remarkRehype, {
			allowDangerousHtml: true,
			handlers: { hashtag: hashTagHandler },
		} satisfies remarkRehypeOptions)
		.use(rehypeRaw)
		.use(rehypeReact, {
			Fragment,
			jsx,
			jsxs,
			components: {
				a: MarkdownLink,
				p: ({ children }) => (
					<span
						style={{
							padding: "0.2em 0",
							display: "block",
						}}
					>
						{children}
					</span>
				),
				hashtag: Hashtag,
			},
		} satisfies RehypeReactOptions);

	return processor;
};
