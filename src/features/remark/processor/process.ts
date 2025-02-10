import { toString as mdastToString } from "mdast-util-to-string";
import { toc } from "mdast-util-toc";
import { VFile } from "vfile";

import { toHeadingSlug } from "@/features/remark/wikilink/util";

import { type VFileData, getFrontMatters } from "../frontmatter";

import type { ReactProcessor } from ".";
import type { Heading, Root } from "mdast";
import type { ReactElement } from "react";
import type { Processor } from "unified";

export const processRemark = (
	{ fPath, title, header }: { fPath: string; title: string; header?: string },
	parseProcessor: Processor<Root, undefined, undefined, Root, string>,
	runProcessor: Processor,
	stringifyProcessor: ReactProcessor,
	fileContent: string,
):
	| {
			content: ReactElement | string;
			title: string;
			data: VFileData;
	  }
	| undefined => {
	// `.`以外にマッチする正規表現

	try {
		const file = new VFile({
			path: fPath,
			value: fileContent,
		});

		const start = performance.now();
		const parseResult = parseProcessor.parse(file);
		console.log("parseResult", performance.now() - start);

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

		const tocResult = toc(parseResult);

		const rehypeResult = runProcessor.runSync(parseResult, file);
		console.log("rehypeResult", performance.now() - start);

		const stringifyResult = stringifyProcessor.stringify(rehypeResult);

		const frontmatterRaw: Record<string, unknown> = (
			typeof file.data.frontmatter === "object" ? file.data.frontmatter : {}
		) as Record<string, unknown>;
		const frontmatter = getFrontMatters(frontmatterRaw);

		return {
			title,
			content: stringifyResult,
			data: {
				frontmatter,
				toc: tocResult.map,
			},
		};
	} catch (error) {
		console.error("コンテンツの取得でエラー", fPath, error);
		return undefined;
	}
};
