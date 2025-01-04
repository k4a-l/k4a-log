import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ReactElement } from "react";
import type { Processor } from "unified";
import { convertNoExtensionPathToMD, lastOfArr } from "./util";

export const getFileContent = async (
	paths: string[],
	directoryPath: string,
	processor: Processor<
		undefined,
		undefined,
		undefined,
		undefined,
		ReactElement
	>,
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
		const compiled = await processor.processSync(fileContent);
		return { title, content: compiled.result };
	} catch (error) {
		console.error(error);
		return {
			title,
			content: `${path.join(...paths)}: ファイルが存在しません`,
		};
	}
};
