import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ReactElement } from "react";
import type { Processor } from "unified";
import type { ReactProcessor } from "../processor";
import { convertNoExtensionPathToMD, lastOfArr } from "./util";

import type { Root } from "mdast";

export const getFileContent = async (
	paths: string[],
	directoryPath: string,
	parseProcessor: Processor<Root, undefined, undefined, Root, string>,
	runProcessor: Processor,
	stringifyProcessor: ReactProcessor,
): Promise<{ content: ReactElement | string; title: string }> => {
	const fPath = path.join(
		path.resolve(),
		directoryPath,
		...convertNoExtensionPathToMD(paths),
	);

	const title = decodeURIComponent(
		lastOfArr(paths)?.replace(/\.(md)/, "") ?? "",
	);

	try {
		const fileContent = await readFile(fPath, { encoding: "utf-8" });
		const parseResult = await parseProcessor.parse(fileContent);
		// console.log(parseResult.children.slice(-10));
		const rehypeResult = await runProcessor.runSync(parseResult);
		const stringifyResult = await stringifyProcessor.stringify(rehypeResult);
		return { title, content: stringifyResult };
	} catch (error) {
		console.error(error);
		return {
			title,
			content: `${path.join(...paths)}: ファイルが存在しません`,
		};
	}
};
