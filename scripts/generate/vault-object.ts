import fs, {} from "node:fs";
import path from "node:path";

import { readFile } from "node:fs/promises";

import { createParseProcessor } from "@/features/remark/processor/parse";

import type {
	TListItemMetaData,
	TPost,
	TPostMetaData,
} from "@/features/metadata/type";
import type { VFileData } from "@/features/remark/frontmatter";
import { createRunProcessor } from "@/features/remark/processor/run";
import { createFileTrees } from "@/features/remark/wikilink/util";
import type { FindFromUnion } from "@/utils/type";
import type { Root, RootContent } from "mdast";
import type { StrictOmit } from "ts-essentials";
import type { Position } from "unist";
import { VFile } from "vfile";

import type { Element, ElementContent } from "hast";

import type { WikiLinkData } from "@/types/mdast";
import { writeFileRecursive } from "@/utils/file";
import { toString as mdastToString } from "mdast-util-to-string";

const assetsDirPath = "./assets";
const postsDirPath = "posts";
const rootDirectoryPath = path.join(assetsDirPath, postsDirPath);

const fileTrees = createFileTrees(rootDirectoryPath);

// 各ファイル全部に繰り返す

type FileEntity = {
	type: "file";
	name: string;
	path: string;
	root: Root;
	fileData: VFileData;
};
type FileOrDirEntity =
	| FileEntity
	| { type: "dir"; name: string; children: FileOrDirEntity[] };

const createParsedTree = async (rootDirPath: string, dirPath: string) => {
	const tree: FileOrDirEntity[] = [];
	const entries = fs.readdirSync(path.join(rootDirPath, dirPath), {
		withFileTypes: true,
	});

	for (const entry of entries) {
		if (entry.name === ".obsidian") continue;
		// `.md`以外の拡張子を持っていたらスキップ（ディレクトリでもない）
		if (entry.name.match(/^(?!.*\.md$).*\..*$/)) continue;

		const pathOfUnderRoot = path.join(dirPath, entry.name);

		if (entry.isDirectory()) {
			tree.push({
				type: "dir",
				name: entry.name,
				children: await createParsedTree(rootDirPath, pathOfUnderRoot),
			});
		} else {
			const fPath = path.join(path.resolve(), rootDirPath, pathOfUnderRoot);
			const fileContent = await readFile(fPath, { encoding: "utf-8" });
			const file = new VFile({
				path: fPath,
				value: fileContent,
			});

			const parseProcessor = createParseProcessor(fileTrees, [
				path.join(pathOfUnderRoot),
			]);
			const runProcessor = createRunProcessor({ excludeToc: true });
			const parseResult = parseProcessor.parse(fileContent);
			const runResult = (await runProcessor.runSync(parseResult, file)) as Root;

			tree.push({
				type: "file",
				name: entry.name,
				path: pathOfUnderRoot,
				root: runResult,
				fileData: file.data as VFileData,
			});
		}
	}

	return tree;
};

const flattenParsedTree = (tree: FileOrDirEntity[]): FileEntity[] => {
	const result: FindFromUnion<FileOrDirEntity, "type", "file">[] = tree.flatMap(
		(t) => (t.type === "dir" ? flattenParsedTree(t.children) : t),
	);
	return result;
};

export const convertNodeToFileMetadata = (
	node: Element | ElementContent | RootContent,
	parentPosition: Position | undefined,
): StrictOmit<TPostMetaData, "frontmatter"> => {
	const r: StrictOmit<TPostMetaData, "frontmatter"> = {
		listItems: [],
		tags: [],
		links: [],
		headings: [],
		embeds: [],
	};

	if (node.type === "element") {
		let parentPositionNext: Position | undefined;

		// HEADING
		if (node.tagName.match(/^h([1-6])$/)) {
			r.headings.push({
				level: Number(RegExp.$1),
				text: mdastToString(node),
			});
		}

		// LINK
		if (node.tagName === "wikilink") {
			const properties =
				node.properties as unknown as WikiLinkData["hProperties"];
			if (properties["is-embed"]) {
				r.embeds.push({
					title: properties.title,
					linkPath: properties.href,
					aliasTitle: properties.alias,
				});
			} else {
				r.links.push({
					title: properties.title,
					linkPath: properties.href,
					aliasTitle: properties.alias,
				});
			}
		}

		// LIST
		if (node.tagName === "li") {
			const text = mdastToString(
				node.children.find((c) => c.type === "element"),
			);
			const regExp = /^\[(.*)\] /;
			const taskStr = text.match(regExp)?.[1];
			const task: TListItemMetaData["task"] =
				taskStr === undefined ? undefined : taskStr.match(/\s/) ? " " : "x";

			r.listItems.push({
				parentLineNumber: parentPosition?.start.line ?? -1,
				text: text.replace(regExp, ""),
				lineNumber: node.position?.start.line ?? -1,
				...(task ? { task } : {}),
			});
			parentPositionNext = node.position;
		}

		// TAG
		if (node.tagName === "hashtag") {
			r.tags.push({ tag: mdastToString(node) });
		}

		const children = node.children.map((c) =>
			convertNodeToFileMetadata(c, parentPositionNext ?? parentPosition),
		);

		r.headings.push(...children.flatMap((c) => c.headings));
		r.links.push(...children.flatMap((c) => c.links));
		r.embeds.push(...children.flatMap((c) => c.embeds));
		r.listItems.push(...children.flatMap((c) => c.listItems));
		r.tags.push(...children.flatMap((c) => c.tags));

		return r;
	}

	return r;
};

export const convertRootContentsToFileMetadata = (
	contents: RootContent[],
): TPostMetaData => {
	const children = contents.flatMap((c) =>
		convertNodeToFileMetadata(c, undefined),
	);
	return {
		embeds: children.flatMap((c) => c.embeds),
		headings: children.flatMap((c) => c.headings),
		links: children.flatMap((c) => c.links),
		listItems: children.flatMap((c) => c.listItems),
		tags: children.flatMap((c) => c.tags),
		frontmatter: {},
	};
};

export const convertFileEntityToTPost = (fileEntity: FileEntity): TPost => {
	const [basename, extension] = fileEntity.name.split(".");
	const data: TPost = {
		basename: basename ?? fileEntity.name,
		extension: extension ?? "",
		path: fileEntity.path,
		metadata: {
			...convertRootContentsToFileMetadata(fileEntity.root.children),
			frontmatter: fileEntity.fileData.frontmatter,
		},
	};
	return data;
};

const main = async () => {
	const parsed = await createParsedTree(rootDirectoryPath, "");
	const flattened = flattenParsedTree(parsed);

	// テスト用MDを変更した場合は、testオブジェクトを出力してテストに使う
	// fs.writeFileSync(
	// 	path.join(__dirname, "root-contents.json"),
	// 	JSON.stringify(flattened[0]?.root.children),
	// );

	const vaultMetadata = flattened.map((f) => convertFileEntityToTPost(f));
	const filePath = path.join(assetsDirPath, "metadata", "vault.json");
	writeFileRecursive(filePath, JSON.stringify(vaultMetadata));
	console.log(`COMPLETED!! >> ${filePath}`);
};
main();
