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

export const createStringifyProcessor = ({
	pathMap,
	meta,
}: { pathMap: PathMap; meta: MetaProps }): ReactProcessor => {
	return remark().use(rehypeReact, {
		Fragment,
		jsx,
		jsxs,
		components: {
			wikilink: (props) => {
				return MarkdownLink({ ...props, pathMap, ...meta });
			},
			"embed-link": EmbeddedLink,
			hashtag: Hashtag,
			"paragraph-wrap": ParagraphWrap,
			blockquote: Callout,
			pre: Pre,
			code: (props) => CodeBlock({ ...props, ...meta }),
		},
	} satisfies RehypeReactOptions);
};
