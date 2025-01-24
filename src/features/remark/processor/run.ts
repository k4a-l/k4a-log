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
import type { VFileData } from "../frontmatter";

import type { TPostMetaData } from "@/features/metadata/type";
import { syncTaskListIds } from "../list";

export const createRunProcessor = (
	metadata: Pick<TPostMetaData, "listItems">,
	options?: {
		excludeToc?: boolean;
	},
): Processor => {
	const { excludeToc } = options ?? {};
	return remark()
		.use(remarkExtractFrontmatter, {
			yaml: yaml.parse,
			name: "frontmatter" satisfies keyof VFileData,
		})
		.use(excludeToc ? () => {} : remarkToc, {
			heading: "目次",
		} satisfies RemarkTocOptions)
		.use(remarkBreaks)
		.use(syncTaskListIds, { taskListMetadata: metadata.listItems })
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
