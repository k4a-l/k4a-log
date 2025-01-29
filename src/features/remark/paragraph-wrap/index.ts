import { u } from "unist-builder";
import { visit } from "unist-util-visit";

import type { PhrasingContent, Root } from "mdast";
import type { Handler } from "mdast-util-to-hast";
import type { Plugin } from "unified";

export const paragraphWrapHandler: Handler = (_h: unknown, node) => {
	return {
		type: "element" as const,
		tagName: "paragraphWrap",
		properties: {},
		children: [u("paragraph", node.type)],
	};
};

export const remarkParagraphWrapPlugin: Plugin = () => {
	return (tree: Root) =>
		visit(tree, "paragraph", (node, i, parent) => {
			const children = node.children;
			const newChildren: PhrasingContent[] = [];
			let buffer: PhrasingContent[] = [];

			// listItemとかを囲むとおかしなことになるのでspanにするだけ
			if (node.children.some((c) => c.type === "break")) {
				node.data = {
					hName: "span",
					hProperties: {
						style: "display: block;  padding: 0.5em 0;",
					},
					...node.data,
				};
				return;
			}

			const flushBuffer = () => {
				if (buffer.length > 1) {
					newChildren.push({
						// @ts-expect-error
						type: "element",
						data: {
							hName: "paragraph-wrap", // HTML タグ名
						},
						children: buffer,
					});
				} else {
					// バッファに1つだけの場合はそのまま追加
					newChildren.push(...buffer);
				}
				buffer = [];
			};

			for (const child of children) {
				if (child.type === "text" && child.value.match(/^\n/)) {
					flushBuffer();
					newChildren.push(child);
				} else {
					buffer.push(child);
				}
			}

			// 最後のバッファをフラッシュ
			flushBuffer();

			// pだとdom違反なので変換
			node.data = {
				...node.data,
				hName: "span",
				hProperties: {
					style:
						parent?.type === "root"
							? "display: block; padding: 0.5em 0"
							: undefined,
				},
			};
			node.children = newChildren;
		});
};
