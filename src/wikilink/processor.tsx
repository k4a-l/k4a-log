import remarkParse from "remark-parse";

import { MarkdownLink } from "@/components/Link";
import wikiLinkPlugin from "@/wikilink";
import type { WikiLinkOption } from "@/wikilink/type";
import type { FileTree } from "@/wikilink/util";
import type { ReactElement } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import rehypeRaw from "rehype-raw";
import rehypeReact, { type Options as RehypeReactOptions } from "rehype-react";
import { remark } from "remark";
import remarkBreaks from "remark-breaks";
import remarkRehype from "remark-rehype";
import type { Processor } from "unified";

export const createProcessor = (
	fileTrees: FileTree[],
	currentPaths: string[],
): Processor<undefined, undefined, undefined, undefined, ReactElement> => {
	const processor = remark()
		.use(remarkParse)
		.use(wikiLinkPlugin, {
			fileTrees,
			currentPaths,
			rootPath: "posts",
		} satisfies WikiLinkOption)
		.use(remarkBreaks)
		.use(remarkRehype, {
			allowDangerousHtml: true,
		})
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
			},
		} satisfies RehypeReactOptions);

	return processor;
};
