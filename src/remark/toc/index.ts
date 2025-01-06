import type { Options } from "mdast-util-toc";

import type { Root } from "mdast";
import { toc } from "mdast-util-toc";

export type RemarkTocOptions = Options;

export default function remarkToc(
	options?: Readonly<Options> | null,
): (tree: Root) => void {
	const settings: Options = {
		...options,
		heading: options?.heading || "(table[ -]of[ -])?contents?|toc",
		tight: options && typeof options.tight === "boolean" ? options.tight : true,
	};

	return (tree: Root): void => {
		const result = toc(tree, settings);

		if (
			result.endIndex === undefined ||
			result.endIndex === -1 ||
			result.index === undefined ||
			result.index === -1 ||
			!result.map
		) {
			return;
		}

		result.map.data = { ...result.map.data, hProperties: { className: "toc" } };

		tree.children = [
			...tree.children.slice(0, result.index),
			result.map,
			...tree.children.slice(result.endIndex),
		];
	};
}
