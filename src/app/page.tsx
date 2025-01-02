import { readFile } from "node:fs/promises";
import path from "node:path";

import html from "rehype-stringify";
import remarkBreaks from "remark-breaks";
import markdown from "remark-parse";
import remark2rehype from "remark-rehype";
import { unified } from "unified";

import wikiLinkPlugin from "@/wikilink";

const processor = unified()
	.use(markdown)
	.use(wikiLinkPlugin)
	.use(remarkBreaks)
	.use(remark2rehype)
	.use(html);

const getFileContent = async (): Promise<string> => {
	const fPath = path.join(
		path.resolve(),
		"assets/tests/posts/SYNTAX TEST",
		"ORIGINAL.md",
	);
	const fileContent = await readFile(fPath, { encoding: "utf-8" });

	const compiled = await processor.process(fileContent);
	return String(compiled.value);
};

export default async function Home() {
	const data = await getFileContent();
	return (
		<div>
			<div
				// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
				dangerouslySetInnerHTML={{ __html: data }}
			/>
		</div>
	);
}
