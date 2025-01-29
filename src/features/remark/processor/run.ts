import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { remark } from "remark";
import remarkBreaks from "remark-breaks";
import remarkExtractFrontmatter from "remark-extract-frontmatter";
import remarkRehype, {
	type Options as remarkRehypeOptions,
} from "remark-rehype";
import yaml from "yaml";

import { hashTagHandler, remarkHashtagPlugin } from "@/features/remark/hashtag";

import RemarkCalloutPlugin from "../callout";
import { remarkEmbedLinks } from "../link";
import { syncTaskListIds } from "../list";
import {
	paragraphWrapHandler,
	remarkParagraphWrapPlugin,
} from "../paragraph-wrap";
import remarkToc, { type RemarkTocOptions } from "../toc";

import type { VFileData } from "../frontmatter";
import type { TNoteMetaData } from "@/features/metadata/type";
import type { Processor } from "unified";

export const createRunProcessor = (
	metadata: Pick<TNoteMetaData, "listItems">,
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
		.use(remarkEmbedLinks)
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
