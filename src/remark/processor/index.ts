import { Callout } from "@/components/Callout";
import { CodeBlock, Pre } from "@/components/CodeBlock";
import { Hashtag } from "@/components/Hashtag";
import { MarkdownLink } from "@/components/Link";
import { ParagraphWrap } from "@/components/ParagraphWrap";
import { hashTagHandler, remarkHashtagPlugin } from "@/remark/hashtag";
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
import RemarkCalloutPlugin from "../callout";
import {
	paragraphWrapHandler,
	remarkParagraphWrapPlugin,
} from "../paragraph-wrap";

export type ReactProcessor = Processor<
	undefined,
	undefined,
	undefined,
	undefined,
	ReactElement
>;

export const createRunProcessor = (): Processor => {
	return remark()
		.use(remarkBreaks)
		.use(RemarkCalloutPlugin)
		.use(remarkHashtagPlugin)
		.use(remarkParagraphWrapPlugin)
		.use(remarkRehype, {
			allowDangerousHtml: true,
			handlers: {
				hashtag: hashTagHandler,
				paragraphWrap: paragraphWrapHandler,
			},
		} satisfies remarkRehypeOptions)
		.use(rehypeRaw);
};

export const createStringifyProcessor = (): ReactProcessor => {
	return remark().use(rehypeReact, {
		Fragment,
		jsx,
		jsxs,
		components: {
			a: MarkdownLink,
			hashtag: Hashtag,
			"paragraph-wrap": ParagraphWrap,
			blockquote: Callout,
			pre: Pre,
			code: CodeBlock,
		},
	} satisfies RehypeReactOptions);
};
