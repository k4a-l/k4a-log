import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import rehypeReact, { type Options as RehypeReactOptions } from "rehype-react";
import { remark } from "remark";

import { Callout } from "@/components/Callout";
import { CodeBlock, Pre } from "@/components/CodeBlock";
import { EmbeddedLink } from "@/components/EmbedLink";
import { Hashtag } from "@/components/Hashtag";
import { MarkdownLink } from "@/components/Link";
import { ParagraphWrap } from "@/components/ParagraphWrap";

import type { MetaProps, PathMap } from "@/features/metadata/type";
import type { ComponentProps, ReactElement } from "react";
import type { Processor } from "unified";

import {} from "@/features/remark/hashtag";

export type ReactProcessor = Processor<
	undefined,
	undefined,
	undefined,
	undefined,
	ReactElement
>;

export const createStringifyProcessor = ({
	pathMap,
	meta,
}: { pathMap: PathMap; meta: MetaProps }): ReactProcessor => {
	const Wikilink = (props: ComponentProps<typeof MarkdownLink>) => {
		return MarkdownLink({ ...props, pathMap, ...meta });
	};
	const Code = (props: ComponentProps<typeof CodeBlock>) =>
		CodeBlock({ ...props, ...meta });

	return remark().use(rehypeReact, {
		Fragment,
		jsx,
		jsxs,
		components: {
			wikilink: Wikilink,
			"embed-link": EmbeddedLink,
			hashtag: Hashtag,
			"paragraph-wrap": ParagraphWrap,
			blockquote: Callout,
			pre: Pre,
			code: CodeBlock,
		},
	} satisfies RehypeReactOptions);
};
