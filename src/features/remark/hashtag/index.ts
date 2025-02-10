import { u } from "unist-builder";
import { visit } from "unist-util-visit";

import { splitByHashtag } from "./util";

import type { Root } from "mdast";
import type { Handler } from "mdast-util-to-hast";
import type { Plugin } from "unified";

export const hashTagHandler: Handler = (_h: unknown, node) => {
	return {
		type: "element" as const,
		tagName: "hashtag",
		properties: {
			className: "hashtag",
		},
		children: [u("text", node.type)],
	};
};

export const remarkHashtagPlugin: Plugin = () => {
	return (tree: Root) =>
		visit(tree, "text", (node, _index, parent) => {
			if (!parent) return;

			const childIndex = parent.children.findIndex((c) => c === node);
			const child = parent.children[childIndex];

			if (child && child.type !== "text") return;
			if (parent.type === "link") return;

			parent.children.filter((c, i) => i !== childIndex);

			const texts = splitByHashtag(child?.value ?? "");

			for (let i = 0; i < texts.length; i++) {
				const text = texts[i] as string;
				if (text.startsWith("#")) {
					const hashTagValue = text.replace("#", "");
					parent.children.splice(childIndex + i, 1, {
						...child,
						// @ts-expect-error
						type: "element",
						data: {
							hName: "hashtag",
							hChildren: [{ type: "text", value: hashTagValue }],
							hProperties: {
								href: hashTagValue,
							},
						},
					});
				} else {
					parent.children.splice(childIndex + i, 1, u("text", text));
				}
			}
		});
};
