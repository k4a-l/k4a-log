import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import rehypeReact, { type Options as RehypeReactOptions } from "rehype-react";
import { remark } from "remark";

import { Callout } from "@/components/Callout";
import { CodeBlock, Pre } from "@/components/CodeBlock";
import { EmbeddedLink } from "@/components/EmbedLink";
import { Hashtag } from "@/components/Hashtag";
import { MarkdownLink } from "@/components/Link";
import { ParagraphWrap } from "@/components/ParagraphWrap";
import type { ReactElement } from "react";
import type { Processor } from "unified";

import {} from "@/features/remark/hashtag";

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
			"embed-link": EmbeddedLink,
			hashtag: Hashtag,
			"paragraph-wrap": ParagraphWrap,
			blockquote: Callout,
			pre: Pre,
			code: CodeBlock,
		},
	} satisfies RehypeReactOptions);
};
