import type { TPostMetaData } from "@/features/metadata/type";
import type { Root } from "node_modules/remark-parse/lib";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

export const syncTaskListIds: Plugin<
	[
		{
			taskListMetadata: TPostMetaData["listItems"];
		},
	]
> = function syncTaskListIds(this, { taskListMetadata }) {
	return (tree: Root) => {
		visit(tree, "listItem", (node) => {
			// ASTノードの行番号を取得
			const startLine = node.position?.start?.line;

			// `taskListMetadata` から対応するデータを探す
			const metadata = taskListMetadata.find(
				(task) => task.lineNumber === startLine,
			);

			if (metadata) {
				// IDを同期
				node.data = node.data || {};
				node.data.hProperties = node.data.hProperties || {};
				node.data.hProperties.id = metadata.id;
			}
		});
	};
};
