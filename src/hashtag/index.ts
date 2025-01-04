import { visit } from "unist-util-visit";

import type { Root } from "mdast";
import type { Handler } from "mdast-util-to-hast";
import { u } from "unist-builder";

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

			//remove this node
			const [child, ...others] = parent.children;
			if (child && child.type !== "text") return;

			parent.children = others;

			// AA#tag BB#tag という文章があったとき、[AA,#tag,BB,#tag]にする関数
			const splitByHashtag = (input: string): string[] => {
				const regex = /#[a-zA-Z0-9]+/g;
				const result: string[] = [];
				let lastIndex = 0;

				input.replace(regex, (match, offset) => {
					// マッチする前の部分を追加
					if (lastIndex < offset) {
						result.push(input.slice(lastIndex, offset));
					}
					// マッチした値を追加
					result.push(match);
					// 次の開始位置を更新
					lastIndex = offset + match.length;
					return match;
				});

				// 最後の部分を追加
				if (lastIndex < input.length) {
					result.push(input.slice(lastIndex));
				}

				return result;
			};

			const texts = splitByHashtag(child?.value ?? "");
			for (const text of texts) {
				if (text.startsWith("#")) parent.children.unshift(u("hashtag", text));
				else parent.children.unshift(u("text", text));
			}
		});
};
