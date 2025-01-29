import { visit } from "unist-util-visit";

import type { PhrasingContent, Root } from "mdast";
import type { Plugin } from "unified";
import type { Node } from "unist";

interface LinkNode extends Node {
	type: string;
	url?: string;
	value?: string;
}

/**
 * remarkBreaksのあとに置くこと
 */
export const remarkEmbedLinks: Plugin = () => {
	return (tree: Root) => {
		visit(tree, (node, index, parent) => {
			if (node.type !== "paragraph") return;
			if (parent?.type !== "root") return;

			if (
				node.children.some((c) => !(c.type === "break" || c.type === "link"))
			) {
				return;
			}

			const newChildren: PhrasingContent[] = [];
			for (const child of node.children) {
				if (child.type === "link") {
					newChildren.push({
						...child,
						// @ts-expect-error
						type: "element",
						data: {
							...child.data,
							hName: "embed-link",
							hProperties: {
								href: child.url,
							},
							hChildren: child.children.flatMap((c) =>
								c.type === "text"
									? {
											type: "text",
											value: c.value,
										}
									: [],
							),
						},
					});
					continue;
				}

				newChildren.push(child);
			}

			// 子ノードを置換
			node.children = newChildren;
		});
	};
};
