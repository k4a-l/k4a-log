import { readFileSync } from "node:fs";
import path from "node:path";

import { withAssetsDirPath } from "@/features/metadata/constant";
import {
	convertNoExtensionPathToMD,
	lastOfArr,
} from "@/features/remark/wikilink/util";
import { convertPathsToLocalMD, safeDecodeURIComponent } from "@/utils/path";

import { processRemark } from "./process";

import type { ReactProcessor } from ".";
import type { VFileData } from "../frontmatter";
import type { Root } from "mdast";
import type { ReactElement } from "react";
import type { Processor } from "unified";

export const getFileContent = (
	paths: string[],
	parseProcessor: Processor<Root, undefined, undefined, Root, string>,
	runProcessor: Processor,
	stringifyProcessor: ReactProcessor,
):
	| {
			content: ReactElement | string;
			title: string;
			data: VFileData;
	  }
	| undefined => {
	const title = safeDecodeURIComponent(
		lastOfArr(paths)?.replace(/\.(md)/, "") ?? "",
	);

	path.join(
		path.resolve(),
		withAssetsDirPath,
		...convertNoExtensionPathToMD(paths).map((p) => p),
	);

	const { fPath, header } = convertPathsToLocalMD(paths);

	try {
		const fileContent = readFileSync(fPath, { encoding: "utf-8" });

		return processRemark(
			{ title, fPath, header },
			parseProcessor,
			runProcessor,
			stringifyProcessor,
			fileContent,
		);
	} catch (error) {
		console.error("コンテンツの取得でエラー", fPath, error);
		return undefined;
	}
};
