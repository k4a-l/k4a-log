import { readFileSync } from "node:fs";
import path from "node:path";

import {
	convertNoExtensionPathToMD,
	lastOfArr,
} from "@/features/remark/wikilink/util";

import type { VFileData } from "../frontmatter";

import type { ReactProcessor } from ".";
import type { Root } from "mdast";
import type { ReactElement } from "react";
import type { Processor } from "unified";
import { safeDecodeURIComponent } from "@/utils/path";
import { withAssetsDirPath } from "@/features/metadata/constant";
import { processRemark } from "./process";

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
	let header: string | undefined;

	const fPath = path.join(
		path.resolve(),
		withAssetsDirPath,
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

	const title = safeDecodeURIComponent(
		lastOfArr(paths)?.replace(/\.(md)/, "") ?? "",
	);

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
