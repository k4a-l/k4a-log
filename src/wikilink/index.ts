import { toMarkdown } from "mdast-util-wiki-link";
import { fromMarkdown, wikiLinkTransclusionFormat } from "./from-markdown";

import { syntax } from "./syntax";

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
		pageResolver: passedOpts.pageResolver
			? passedOpts.pageResolver
			: (_name) => {
					if (!_name) return [""];
					let name = _name;

					const image = wikiLinkTransclusionFormat(name)[1];
					let heading = "";
					if (!image && !name.startsWith("#") && name.match(/#/)) {
						[, heading] = name.split("#");
						name = name.replace(`#${heading}`, "");
					} else if (name.startsWith("#")) {
						name = name.toLowerCase();
					}
					if (passedOpts.permalinks || passedOpts.markdownFolder) {
						const url = passedOpts?.permalinks?.find(
							(p) =>
								p === name ||
								(p.split("/").pop() === name &&
									!passedOpts?.permalinks?.includes(p.split("/").pop() ?? "")),
						);
						if (url) {
							if (heading)
								return [`${url}#${heading.toLowerCase()}`.replace(/ /g, "-")];
							return image ? [url] : [url.replace(/ /g, "-")];
						}
					}
					return image ? [name] : [name.replace(/ /g, "-")];
				},
		// permalinks: passedOpts.markdownFolder
		// 	? getFiles(passedOpts.markdownFolder).map((file) =>
		// 			file.replace(/\.mdx?$/, ""),
		// 		)
		// 	: passedOpts.permalinks,
	};

	data.fromMarkdownExtensions;

	add("micromarkExtensions", syntax(opts));
	add("fromMarkdownExtensions", fromMarkdown(opts));
};

export default wikiLinkPlugin;
