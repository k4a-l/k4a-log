import { readFile } from "node:fs/promises";

import path from "node:path";
import remarkParse from "remark-parse";

import { remark } from "remark";

import { Link } from "@/components/Link";
import wikiLinkPlugin from "@/wikilink";
import type { WikiLinkOption } from "@/wikilink/type";
import { convertNoExtensionPathToMD, createFileTrees } from "@/wikilink/util";
import { Fragment, type ReactElement } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import rehypeRaw from "rehype-raw";
import rehypeReact from "rehype-react";
import type { Options as RehypeReactOptions } from "rehype-react";
import remarkBreaks from "remark-breaks";
import remarkRehype from "remark-rehype";

const directoryPath = "./assets/posts";
const fileTrees = createFileTrees(directoryPath);

const currentPaths = ["tests", "SYNTAX TEST", "ORIGINAL"];

const processor = remark()
	.use(remarkParse)
	.use(wikiLinkPlugin, {
		fileTrees,
		currentPaths,
		rootPath: "posts",
	} satisfies WikiLinkOption)
	.use(remarkBreaks)
	.use(remarkRehype, {
		allowDangerousHtml: true,
	})
	.use(rehypeRaw)
	.use(rehypeReact, {
		Fragment,
		jsx,
		jsxs,
		components: { a: Link },
	} satisfies RehypeReactOptions);

const getFileContent = async (paths: string[]): Promise<ReactElement> => {
	const fPath = path.join(
		path.resolve(),
		directoryPath,
		...convertNoExtensionPathToMD(paths),
	);
	try {
		const fileContent = await readFile(fPath, { encoding: "utf-8" });
		const compiled = await processor.processSync(fileContent);
		return compiled.result;
	} catch (error) {
		console.error(error);
		return <>{path.join(...paths)}: ファイルが存在しません</>;
	}
};

export default async function Home({ params }: { params: { page: string[] } }) {
	const paths = (await params).page;

	const data = await getFileContent(paths);
	return <div>{data}</div>;
}
