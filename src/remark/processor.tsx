import remarkParse from "remark-parse";

import { Hashtag } from "@/components/Hashtag";
import { MarkdownLink } from "@/components/Link";
import { hashTagHandler, remarkHashtagPlugin } from "@/remark/hashtag";
import wikiLinkPlugin from "@/remark/wikilink";
import type { WikiLinkOption } from "@/remark/wikilink/type";
import type { FileTree } from "@/remark/wikilink/util";
import type { ReactElement } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import rehypeRaw from "rehype-raw";
import rehypeReact, { type Options as RehypeReactOptions } from "rehype-react";
import { remark } from "remark";
import remarkBreaks from "remark-breaks";
import remarkRehype, {
	type Options as remarkRehypeOptions,
} from "remark-rehype";
import { css } from "styled-system/css";
import { Box } from "styled-system/jsx";
import type { Processor } from "unified";
import RemarkCalloutPlugin from "./callout";
import {
	paragraphWrapHandler,
	remarkParagraphWrapPlugin,
} from "./paragraph-wrap";

export const createProcessor = (
	fileTrees: FileTree[],
	_parentsLinks: string[],
): Processor<undefined, undefined, undefined, undefined, ReactElement> => {
	const parentsLinks = _parentsLinks
		.map((p) => decodeURIComponent(p))
		.map((p) => p.replace(/\\+/g, "/").replace(/.md$/, ""));

	const processor = remark()
		.use(remarkParse)
		.use(remarkHashtagPlugin)
		.use(remarkBreaks)
		.use(wikiLinkPlugin, {
			fileTrees,
			assetPath: "assets",
			rootPath: "posts",
			parentsLinks,
		} satisfies WikiLinkOption)
		.use(RemarkCalloutPlugin)
		// paragraphWrapを後ろに持っていく都合上、Callout内で横並びが出来ない
		.use(remarkParagraphWrapPlugin)
		.use(remarkRehype, {
			allowDangerousHtml: true,
			handlers: {
				hashtag: hashTagHandler,
				paragraphWrap: paragraphWrapHandler,
			},
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
				"paragraph-wrap": ({ children }) => (
					<Box
						className={css({
							whiteSpace: "normal",
							display: "inline-block",
							"& > img,video": {
								display: "inline",
								verticalAlign: "top",
								gap: 0,
							},
						})}
					>
						{children}
					</Box>
				),
			},
		} satisfies RehypeReactOptions);

	return processor;
};
