import {} from "@/components/CodeBlock";
import { hashTagHandler, remarkHashtagPlugin } from "@/features/remark/hashtag";
import {} from "react/jsx-runtime";
import rehypeRaw from "rehype-raw";

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

import rehypeSlug from "rehype-slug";
import remarkToc, { type RemarkTocOptions } from "../toc";

import remarkExtractFrontmatter from "remark-extract-frontmatter";

import yaml from "yaml";

export const createRunProcessor = (): Processor => {
	return remark()
		.use(remarkExtractFrontmatter, { yaml: yaml.parse, name: "frontMatter" })
		.use(remarkToc, { heading: "目次" } satisfies RemarkTocOptions)
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
		.use(rehypeSlug)
		.use(rehypeRaw);
};
