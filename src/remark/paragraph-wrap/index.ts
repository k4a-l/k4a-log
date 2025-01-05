import { visit } from "unist-util-visit";

import type { PhrasingContent, Root } from "mdast";
import type { Handler } from "mdast-util-to-hast";
import { u } from "unist-builder";

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
		visit(tree, "paragraph", (node) => {
			const children = node.children;
			const newChildren: PhrasingContent[] = [];
			let buffer: PhrasingContent[] = [];

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

			node.children = newChildren;
		});
};
