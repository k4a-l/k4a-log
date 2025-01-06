import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Heading, Root } from "mdast";
import { toString as mdastToString } from "mdast-util-to-string";
import type { ReactElement } from "react";
import type { Processor } from "unified";
import type { ReactProcessor } from "../processor";
import { convertNoExtensionPathToMD, lastOfArr, toHeadingSlug } from "./util";

export const getFileContent = async (
	paths: string[],
	directoryPath: string,
	parseProcessor: Processor<Root, undefined, undefined, Root, string>,
	runProcessor: Processor,
	stringifyProcessor: ReactProcessor,
): Promise<{ content: ReactElement | string; title: string }> => {
	let header: string | undefined;

	const fPath = path.join(
		path.resolve(),
		directoryPath,
		...convertNoExtensionPathToMD(paths).map((p) => {
			// ヘッダー付きリンクの整形
			const matched = p.match(/^.+#([^.]*).*$/);
			if (matched) {
				header = matched[1];
				return p.replace(new RegExp(`#${header}`), "");
			}
			return p;
		}),
	);

	// `.`以外にマッチする正規表現

	const title = decodeURIComponent(
		lastOfArr(paths)?.replace(/\.(md)/, "") ?? "",
	);

	try {
		const fileContent = await readFile(fPath, { encoding: "utf-8" });
		const parseResult = await parseProcessor.parse(fileContent);

		if (header) {
			const targetHeaderIndex = parseResult.children.findIndex(
				(c) =>
					c.type === "heading" && toHeadingSlug(mdastToString(c)) === header,
			);
			const targetHeader = parseResult.children[targetHeaderIndex] as
				| Heading
				| undefined;
			const targetHeaderFinishIndex = parseResult.children.findIndex((c, i) => {
				if (!targetHeader) return false;
				if (i <= targetHeaderIndex) return false;
				if (c.type === "heading" && c.depth <= targetHeader.depth) return true;
				return false;
			});
			const headerChildren = parseResult.children.slice(
				targetHeaderIndex,
				targetHeaderFinishIndex,
			);
			parseResult.children = headerChildren;
		}
		const rehypeResult = await runProcessor.runSync(parseResult);
		const stringifyResult = await stringifyProcessor.stringify(rehypeResult);
		return { title, content: stringifyResult };
	} catch (error) {
		console.error(error);
		return {
			title,
			content: `${title}: ファイルが存在しません`,
		};
	}
};
