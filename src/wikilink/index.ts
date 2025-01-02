import { fromMarkdown } from "./from-markdown";

import { wikiLinkTokenize } from "./syntax";

import type { Extension as mDastExtension } from "mdast-util-from-markdown";
import type { Extension as MicromarkExtension } from "micromark-util-types";
import type { Plugin, Processor } from "unified";
import type { WikiLinkOption } from "./type";

/**
 *
 * @overload
 * @param {Processor} processor
 * @param {Readonly<Options> | null | undefined} [options]
 * @returns {TransformBridge}
 *
 * @overload
 * @param {Readonly<Options> | null | undefined} [options]
 * @returns {TransformMutate}
 *
 * @param {Readonly<Options> | Processor | null | undefined} [destination]
 *   Processor or configuration (optional).
 * @param {Readonly<Options> | null | undefined} [options]
 *   When a processor was given, configuration (optional).
 * @returns {TransformBridge | TransformMutate}
 *   Transform.
 */
const wikiLinkPlugin = function wikiLinkPlugin(
	this: Processor,
	options: WikiLinkOption = {},
) {
	const data = this.data();

	function add(
		field: "micromarkExtensions" | "fromMarkdownExtensions",
		value: MicromarkExtension | mDastExtension,
	) {
		if (data[field]) data[field].push(value);
		else data[field] = [value];
	}

	if (!options.currentPaths) {
		throw new Error("currentPathsを設定してください");
	}
	if (!options.fileTrees) {
		throw new Error("fileTreesを設定してください");
	}

	const opts: Required<WikiLinkOption> = {
		classNames: {
			deadLink: "dead",
			wikiLink: "wikiLink",
			...options.classNames,
		},
		currentPaths: [],
		fileTrees: [],
		...options,
	};

	data.fromMarkdownExtensions;

	add("micromarkExtensions", wikiLinkTokenize(opts));
	add("fromMarkdownExtensions", fromMarkdown(opts));
} satisfies Plugin;

export default wikiLinkPlugin;
