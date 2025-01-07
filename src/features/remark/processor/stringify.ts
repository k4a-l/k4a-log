import { Callout } from "@/components/Callout";
import { CodeBlock, Pre } from "@/components/CodeBlock";
import { Hashtag } from "@/components/Hashtag";
import { MarkdownLink } from "@/components/Link";
import { ParagraphWrap } from "@/components/ParagraphWrap";
import {} from "@/features/remark/hashtag";
import type { ReactElement } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import rehypeReact, { type Options as RehypeReactOptions } from "rehype-react";
import { remark } from "remark";
import type { Processor } from "unified";

export type ReactProcessor = Processor<
	undefined,
	undefined,
	undefined,
	undefined,
	ReactElement
>;

export const createStringifyProcessor = (): ReactProcessor => {
	return remark().use(rehypeReact, {
		Fragment,
		jsx,
		jsxs,
		components: {
			wikilink: MarkdownLink,
			hashtag: Hashtag,
			"paragraph-wrap": ParagraphWrap,
			blockquote: Callout,
			pre: Pre,
			code: CodeBlock,
		},
	} satisfies RehypeReactOptions);
};
