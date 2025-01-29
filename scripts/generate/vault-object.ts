import fs, {} from "node:fs";
import path from "node:path";

import { readFile } from "node:fs/promises";

import { createParseProcessor } from "@/features/remark/processor/parse";

import { v4 as uuid } from "uuid";

import type {
	PathMap,
	TLinkMetaData,
	TListItemMetaData,
	TNote,
	TNoteIndependence,
	TNoteMetaData,
	TVault,
	YMMap,
} from "@/features/metadata/type";
import {
	type VFileData,
	frontMatterKeys,
	idParser,
} from "@/features/remark/frontmatter";
import { createRunProcessor } from "@/features/remark/processor/run";
import {
	type FileTree,
	createFileTrees,
	imageExtensions,
} from "@/features/remark/wikilink/util";
import type { FindFromUnion } from "@/utils/type";
import type { Root, RootContent } from "mdast";
import type { StrictOmit } from "ts-essentials";
import type { Position } from "unist";
import { VFile } from "vfile";

import type { Element, ElementContent } from "hast";

import { getFileDate } from "@/components/FrontMatter/util";
import {
	notesDirPath,
	vaultMetadataFilePath,
	withAssetsDirPath,
} from "@/features/metadata/constant";
import type { WikiLinkData } from "@/types/mdast";
import { writeFileRecursive } from "@/utils/file";
import {
	dividePathAndExtension,
	hasExtensionButNotMD,
	isSamePath,
	normalizePath,
} from "@/utils/path";
import { toString as mdastToString } from "mdast-util-to-string";

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

const createParsedTree = async (
	fileTrees: FileTree[],
	rootDirPath: string,
	dirPath: string,
) => {
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
				children: await createParsedTree(
					fileTrees,
					rootDirPath,
					pathOfUnderRoot,
				),
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
			const runProcessor = createRunProcessor(
				{ listItems: [] },
				{ excludeToc: true },
			);
			const parseResult = parseProcessor.parse(fileContent);
			const runResult = (await runProcessor.runSync(parseResult, file)) as Root;

			tree.push({
				type: "file",
				name: entry.name,
				path: normalizePath(pathOfUnderRoot),
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
	currentPath: string,
): StrictOmit<TNoteMetaData, "frontmatter"> => {
	const r: StrictOmit<TNoteMetaData, "frontmatter"> = {
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
			const isOwnLink = isSamePath(properties.href, currentPath);

			if (!properties.href.startsWith("#") && !isOwnLink) {
				const path = normalizePath(
					properties.href.split("#")[0] ?? properties.href,
				);
				const title = properties.title.split("#")[0] ?? properties.title;
				if (properties["is-embed"]) {
					r.embeds.push({
						title: title,
						path: path,
						aliasTitle: properties.alias,
						position: node.position,
					});
				} else {
					r.links.push({
						title: title,
						path: path,
						aliasTitle: properties.alias,
						position: node.position,
					});
				}
			}
		}

		// LIST
		if (node.tagName === "li") {
			const className = Array.isArray(node.properties.className)
				? node.properties.className
				: [node.properties.className];
			if (className?.includes("task-list-item")) {
				const text = mdastToString(node.children).replace(/\n/g, "");
				const task: TListItemMetaData["task"] = node.children.some(
					(c) =>
						c.type === "element" &&
						c.tagName === "input" &&
						c.properties.checked,
				)
					? "x"
					: " ";

				r.listItems.push({
					parentLineNumber: parentPosition?.start.line ?? -1,
					text: text,
					lineNumber: node.position?.start.line ?? -1,
					task,
					id: uuid(),
				});
			} else {
				const text = mdastToString(
					node.children.find((c) => c.type === "element"),
				);

				r.listItems.push({
					parentLineNumber: parentPosition?.start.line ?? -1,
					text: text,
					lineNumber: node.position?.start.line ?? -1,
					id: uuid(),
				});
			}

			parentPositionNext = node.position;
		}

		// TAG
		if (node.tagName === "hashtag") {
			r.tags.push({ tag: mdastToString(node) });
		}

		// if (node.tagName === "input") {
		// 	console.log(node);
		// 	const text = mdastToString(
		// 		node.children.find((c) => c.type === "element"),
		// 	);
		// 	const regExp = /^\[(.*)\] /;
		// 	const task: TListItemMetaData["task"] = node.properties.checked
		// 		? "x"
		// 		: " ";

		// 	r.listItems.push({
		// 		parentLineNumber: parentPosition?.start.line ?? -1,
		// 		text: text.replace(regExp, ""),
		// 		lineNumber: node.position?.start.line ?? -1,
		// 		...(task ? { task } : {}),
		// 	});
		// 	parentPositionNext = node.position;
		// }

		const children = node.children.map((c) =>
			convertNodeToFileMetadata(
				c,
				parentPositionNext ?? parentPosition,
				currentPath,
			),
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
	currentPath: string,
): TNoteMetaData => {
	const children = contents.flatMap((c) =>
		convertNodeToFileMetadata(c, undefined, currentPath),
	);
	return {
		embeds: children.flatMap((c) => c.embeds),
		headings: children.flatMap((c) => c.headings),
		// 同じpathを持っているものは正規化する
		links: children
			.flatMap((c) => c.links)
			.reduce((acc, l) => {
				const found = acc.find((a) => a.path === l.path);
				if (found) return acc;
				acc.push(l);
				return acc;
			}, [] as TLinkMetaData[]),
		listItems: children.flatMap((c) => c.listItems),
		tags: children.flatMap((c) => c.tags),
		frontmatter: {},
	};
};

export const convertFileEntityToTNoteIndependence = (
	fileEntity: FileEntity,
): TNoteIndependence => {
	const currentPath = normalizePath(path.join(notesDirPath, fileEntity.path));
	const [basename, extension] = fileEntity.name.split(".");
	const metadata = convertRootContentsToFileMetadata(
		fileEntity.root.children,
		currentPath,
	);
	const thumbnailPath = [...metadata.embeds, ...metadata.links]
		.sort((a, b) => {
			if (!a.position && b.position) return 0;
			if (!a.position) return 1;
			if (!b.position) return -1;
			if (a.position?.start.line < b.position?.start.line) {
				return -1;
			}
			if (a.position.start.line > b.position?.start.line) {
				return 1;
			}
			if (a.position.start.column < b.position?.start.column) {
				return -1;
			}
			return 0;
		})
		.find((e) => imageExtensions.some((r) => e.path.match(r)))?.path;

	const frontmatter = fileEntity.fileData.frontmatter;

	const data: TNoteIndependence = {
		basename: basename ?? fileEntity.name,
		extension: extension ?? "",
		path: currentPath,
		metadata: {
			...metadata,
			frontmatter: {
				...frontmatter,
				[frontMatterKeys.description.key]:
					frontmatter?.description ||
					mdastToString(fileEntity.root)
						.substring(0, 150)
						.replaceAll("\n", " "),
			},
		},
		thumbnailPath,
	};
	return data;
};

export const injectAllLinksToTNoteIndependence = (
	iNotes: TNoteIndependence[],
): TNote[] => {
	const notes = iNotes.map((p): TNote => {
		return { ...p, backLinks: [], twoHopLinks: [] };
	});

	// inject backLink
	for (const note of iNotes) {
		for (const link of [...note.metadata.links, ...note.metadata.embeds]) {
			// .md以外の.**の場合は何もしない
			if (hasExtensionButNotMD(link.path)) continue;

			const targetIndex = notes.findIndex((p) => {
				return isSamePath(dividePathAndExtension(p.path)[0], link.path);
			});
			const target = notes[targetIndex];
			if (target?.backLinks.find((t) => t.path === note.path)) continue;
			notes[targetIndex]?.backLinks.push({
				path: note.path,
				title: note.basename,
				thumbnailPath: note.thumbnailPath,
			});
		}
	}

	/** inject twoHopLink
	 * https://help.masui.org/2%E3%83%9B%E3%83%83%E3%83%97%E3%83%AA%E3%83%B3%E3%82%AF%E3%81%AE%E8%80%83%E5%AF%9F-5b6f9e74b1b77e00148f8c42 より
	 * `A→C, B→Cというリンクが存在するとき、AとBの間にはなんらかの関連があると考えてよい。`
	 * `「和歌山」→「みかん」、「愛媛県」→「みかん」 ならば「和歌山県」と「愛媛県」はみかんつながりがある`
	 * これは納得できる。①
	 *
	 * だた、ScrapBoxでは「A→B、A->C」では、BとCにはlinkは関係性は作られない。これについて考える。
	 * 「和歌山→みかん」、「和歌山→白浜温泉」のとき、「みかん」と「白浜温泉」にも和歌山つながりがあるといえないだろうか？②
	 *
	 * 「A->B、C->A」の場合はどうか
	 * 「和歌山→みかん」、「白浜温泉→和歌山」、同じ例を使っちゃうとこれも関連があるように見えてしまう...③
	 *
	 * 書き方の表記ゆれなだけか？
	 * ①: 和歌山の名産はみかん、愛媛の名産はみかん → 「和歌山」と「愛媛」の名産繋がりなので確かに関連は強い
	 * ②: 和歌山の名産はみかん、和歌山の観光地は白浜温泉 → 和歌山という共通点はあるが、みかんと白浜温泉に関係があるかというとやや弱い
	 * ③: 和歌山の名産はみかん、白浜温泉は和歌山の観光地 → 関係性②と同じで、さらに主語述語が逆なので更に弱い
	 * こう整理すると、どれを選ぶかというと①が最有力になる
	 *
	 * 日本語で表すと、「同じfrontLinkを持つものを関連づけ、frontLink経由のtwoHopLinkとする」という感じ
	 */

	for (const note of notes) {
		for (const link of [...note.metadata.links, ...note.metadata.embeds]) {
			if (note.twoHopLinks?.find((thl) => thl.path === link.path)) continue;
			// .md以外の.**の場合は何もしない
			if (hasExtensionButNotMD(link.path)) continue;

			// 同じlinkを持つものをまとめる
			const targets = notes.filter((p) => {
				// おおもとのファイルと同じ場合は除外
				if (isSamePath(note.path, p.path)) {
					return false;
				}
				return [...p.metadata.links, ...p.metadata.embeds].find((l) => {
					// おおもとのファイルと同じ場合は除外
					if (isSamePath(note.path, l.path)) {
						return false;
					}
					// backLinkに含まれていたら除外
					if (note.backLinks.some((bl) => isSamePath(bl.path, l.path))) {
						return false;
					}
					// 画像なども除外
					if (hasExtensionButNotMD(link.path)) {
						return false;
					}
					return isSamePath(l.path, link.path);
				});
			});

			// twoHopLinksが空ならそもそも追加しない
			if (!targets.length) continue;

			note.twoHopLinks.push({
				links: targets.map((t) => ({
					path: t.path,
					title: t.basename,
					thumbnailPath: t.thumbnailPath,
				})),
				path: link.path,
				title: link.title,
			});
		}
	}
	return notes;
};

/**
 * key: 元の名前、value: uid
 */
const createPathMap = (files: FileEntity[]): PathMap => {
	const pathMap: PathMap = {};
	for (const file of files) {
		const id = idParser(file, file.fileData.frontmatter);

		if (id) {
			const pathName = normalizePath(path.join(notesDirPath, file.path));
			pathMap[pathName] = normalizePath(path.join(notesDirPath, id));
		}
	}
	return pathMap;
};

const createCreatedMap = (files: TNote[]): YMMap => {
	const createdMap: YMMap = {};
	for (const file of files) {
		const { created } =
			getFileDate({
				frontmatter: file.metadata.frontmatter,
			}) ?? {};

		if (!created) continue;

		const year = created.getFullYear();
		const month = created.getMonth() + 1;
		if (!createdMap[year]) createdMap[year] = {};
		if (!createdMap[year][month]) createdMap[year][month] = [];
		createdMap[year][month].push(file.path);
	}
	return createdMap;
};

export const createVaultFile = async (): Promise<TVault> => {
	const fileTrees = createFileTrees(withAssetsDirPath);
	const parsed = await createParsedTree(fileTrees, withAssetsDirPath, "");
	const flattened = flattenParsedTree(parsed);
	const pathMap = createPathMap(flattened);

	// テスト用MDを変更した場合は、testオブジェクトを出力してテストに使う
	// fs.writeFileSync(
	// 	path.join(__dirname, "root-contents.json"),
	// 	JSON.stringify(flattened[0]?.root.children),
	// );

	const tiNotes = flattened.map((f) => convertFileEntityToTNoteIndependence(f));
	const tNotes = injectAllLinksToTNoteIndependence(tiNotes);
	const createdMap = createCreatedMap(tNotes);

	return { notes: tNotes, pathMap, createdMap };
};

export const main = async () => {
	const vaultFile = await createVaultFile();
	writeFileRecursive(vaultMetadataFilePath, JSON.stringify(vaultFile));
	console.log(`COMPLETED!! >> ${vaultMetadataFilePath}`);
};

const [funcName] = process.argv.slice(2);
if (funcName === "main") main();
