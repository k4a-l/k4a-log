import { fromMarkdown } from "./from-markdown";

import { wikiLinkTokenize } from "./syntax";

import type { Extension as mDastExtension } from "mdast-util-from-markdown";
import type { Extension as MicromarkExtension } from "micromark-util-types";
import type { Plugin, Processor } from "unified";
import type { WikiLinkOption } from "./type";

const wikiLinkPlugin: Plugin = function wikiLinkPlugin(
	this: Processor,
	passedOpts: WikiLinkOption = {},
) {
	const data = this.data();

	function add(
		field: "micromarkExtensions" | "fromMarkdownExtensions",
		value: MicromarkExtension | mDastExtension,
	) {
		if (data[field]) data[field].push(value);
		else data[field] = [value];
	}

	const opts: WikiLinkOption = {
		...passedOpts,
		aliasDivider: passedOpts.aliasDivider ? passedOpts.aliasDivider : "|",
		pageResolver: passedOpts.pageResolver,
		// permalinks: passedOpts.markdownFolder
		// 	? getFiles(passedOpts.markdownFolder).map((file) =>
		// 			file.replace(/\.mdx?$/, ""),
		// 		)
		// 	: passedOpts.permalinks,
	};

	data.fromMarkdownExtensions;

	add("micromarkExtensions", wikiLinkTokenize(opts));
	add("fromMarkdownExtensions", fromMarkdown(opts));
};

export default wikiLinkPlugin;
