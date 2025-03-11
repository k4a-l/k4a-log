import fs, {} from "node:fs";
import { readFile } from "node:fs/promises";

import { toString as mdastToString } from "mdast-util-to-string";
import path from "path-browserify";
import { v4 as uuid } from "uuid";
import { VFile } from "vfile";

import { getFileDate } from "@/components/FrontMatter/util";
import {
	folderFilePath,
	vaultMetadataFilePath,
	withAssetsDirPath,
} from "@/features/metadata/constant";
import {
	type VFileData,
	frontMatterKeys,
	idParser,
} from "@/features/remark/frontmatter";
import { createParseProcessor } from "@/features/remark/processor/parse";
import { createRunProcessor } from "@/features/remark/processor/run";
import {
	type FileNode,
	type FileTree,
	createFileTrees,
} from "@/features/remark/wikilink/util";
import { writeFileRecursive } from "@/utils/file";
import {
	dividePathAndExtension,
	getLinkOrId,
	hasExtensionButNotMD,
	isSamePath,
	isTestOnlyNote,
	normalizePath,
} from "@/utils/path";

import { getThumbnailPath, loggingWithColor } from "../util";

import {
	isContainNGWords,
	isMatchNodeCondition,
	PUBLIC_CONDITION,
} from "./check";
import { NG_WORDS, SAFE_WORDS } from "./check";
import { buildFileTree } from "./folder";

import type { FileEntity, FileOrDirEntity } from "./type";
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
import type { WikiLinkData } from "@/types/mdast";
import type { Element, ElementContent } from "hast";
import type { Root, RootContent } from "mdast";
import type { StrictOmit } from "ts-essentials";
import type { Position } from "unist";

// 各ファイル全部に繰り返す

const createParsedTree = async (
	fileTrees: FileTree[],
	fileNode: FileNode[],
	rootDirPath: string,
	dirPath: string,
): Promise<FileOrDirEntity[]> => {
	const tree: FileOrDirEntity[] = [];
	const entries = fs.readdirSync(path.join(rootDirPath, dirPath), {
		withFileTypes: true,
	});

	for (const entry of entries) {
		// bytesize
		if (new Blob([entry.name]).size > 254) {
			loggingWithColor("red", entry.name);
			throw new Error("bytesize over 255");
		}

		if (entry.name === ".obsidian") continue;
		// `.md`以外の拡張子を持っていたらスキップ（ディレクトリでもない）
		if (entry.name.match(/^(?!.*\.md$).*\..*$/)) continue;

		const pathOfUnderRoot = path.join(dirPath, entry.name);

		if (entry.isDirectory()) {
			// 公開対象じゃなければスキップ
			if (
				!isMatchNodeCondition(
					{
						basename: entry.name,
						path: pathOfUnderRoot,
						metadata: { frontmatter: {}, tags: [] },
					},
					PUBLIC_CONDITION,
				)
			) {
				loggingWithColor("yellow", `PRIVATE DIR >>  ${pathOfUnderRoot}`);
				continue;
			}

			tree.push({
				type: "dir",
				name: entry.name,
				children: await createParsedTree(
					fileTrees,
					fileNode,
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

			const parseProcessor = createParseProcessor(
				[pathOfUnderRoot].map((p) => encodeURIComponent(p)),
				fileNode,
				{},
			);
			const runProcessor = createRunProcessor(
				{ listItems: [] },
				{ excludeToc: true },
			);
			const parseResult = parseProcessor.parse(fileContent);
			const runResult = (await runProcessor.runSync(parseResult, file)) as Root;
			const frontmatter = (file.data as VFileData).frontmatter;

			const currentPath = normalizePath(pathOfUnderRoot);
			const [basename, extension] = dividePathAndExtension(entry.name);
			const metadata = createNoteMetaData(
				runResult.children,
				normalizePath(path.join(currentPath)),
			);
			const thumbnailPath = getThumbnailPath(
				{ path: currentPath, frontmatter },
				metadata,
				fileNode,
			);

			const data: FileEntity = {
				type: "file",
				basename: basename ?? entry.name,
				extension: extension ?? "",
				path: currentPath,
				metadata: {
					...metadata,
					frontmatter: {
						...frontmatter,
						[frontMatterKeys.description.key]:
							frontmatter?.description ||
							mdastToString(runResult).substring(0, 150).replaceAll("\n", " "),
					},
				},
				thumbnailPath,
			};

			// 公開対象じゃなければスキップ
			if (!isMatchNodeCondition(data, PUBLIC_CONDITION)) {
				loggingWithColor("yellow", `PRIVATE FILE >>  ${currentPath}`);
				continue;
			}
			// NGチェックは強制終了
			const isNG = isContainNGWords(fileContent, NG_WORDS, SAFE_WORDS);
			if (isNG) {
				throw new Error(
					`NGチェックに引っかかったファイル:${pathOfUnderRoot} NGワード: ${NG_WORDS}`,
				);
			}

			// ファイルごと消してしまう？→一旦スキップだけで
			// これ以降はこの関数で作った情報だけが使われるので（アセットコピーも）
			tree.push(data);
		}
	}

	return tree;
};

const flattenParsedTree = (tree: FileOrDirEntity[]): TNoteIndependence[] => {
	const result: TNoteIndependence[] = tree.flatMap((t) => {
		if (t.type === "file") {
			const { type, ...others } = t;
			return others;
		}
		return flattenParsedTree(t.children);
	});

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
				const link = normalizePath(
					properties.href.split("#")[0] ?? properties.href,
				);
				const title =
					properties.alias ??
					properties.title.split("#")[0] ??
					properties.title;
				if (properties["is-embed"]) {
					r.embeds.push({
						title: title,
						path: link,
						aliasTitle: properties.alias,
						position: node.position,
						isTagLink: properties.isTagLink === "true",
					});
				} else {
					r.links.push({
						title: title,
						path: link,
						aliasTitle: properties.alias,
						position: node.position,
						isTagLink: properties.isTagLink === "true",
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
				const text = mdastToString(
					node.children.find(
						(c) => c.type === "element" && c.tagName === "span",
					),
				).replace(/\n/g, "");
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

export const createNoteMetaData = (
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

export const injectAllLinksToTNoteIndependence = (
	iNotes: TNoteIndependence[],
	pathMap: PathMap,
): TNote[] => {
	const notes = iNotes.map((p): TNote => {
		return { ...p, backLinks: [], twoHopLinks: [] };
	});

	loggingWithColor("cyan", "backlink");
	// inject backLink
	for (const note of iNotes) {
		process.stdout.write(`${note.basename}`);
		process.stdout.write("\r");

		for (const link of [...note.metadata.links, ...note.metadata.embeds]) {
			// .md以外の.**の場合は何もしない
			if (hasExtensionButNotMD(link.path)) continue;

			const targetIndex = notes.findIndex((p) => {
				const [baseName] = dividePathAndExtension(p.path);
				return isSamePath(baseName, link.path);
			});
			const target = notes[targetIndex];
			if (target?.backLinks.find((t) => t.path === note.path)) continue;
			notes[targetIndex]?.backLinks.push({
				path: getLinkOrId(note.path, pathMap),
				title: note.basename,
				thumbnailPath: note.thumbnailPath,
			});
		}
	}

	const noteLinkMap = new Map<string, Set<string>>();
	for (const note of notes) {
		const set = new Set<string>(
			[...note.metadata.links, ...note.metadata.embeds].map((p) =>
				normalizePath(p.path),
			),
		);
		noteLinkMap.set(normalizePath(note.path), set);
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
	 * 日本語で表すと、「同じfrontLinkを持つものを関連づけ、frontLink経由のtwoHopLinkとする」という感じ
	 *
	 * ①はボトムアップ式（タグ付け）による整理で紐づける方法と言える
	 *  この場合、AとBが一覧されている場所は存在しないので、twoHopでその場を用意するのは妥当
	 * ②はトップダウン式（MOC）による整理で紐づける方法と言える
	 *  この場合、BからバックリンクでAに戻ればMOCでBとCが関連付けられているので、twoHopに含めなくても一覧参照ができる
	 *  なので、twoHopにあっても良いが、無くても完全には困らないということになる
	 * ③は整理ではなくリンク遷移の繰り返し
	 *  BとCはC->A->Bで直接遷移できるので、twoHopに含める必要は無い
	 *  直接遷移できるという意味では①もBからバックリンクでAに、AからCへの遷移は可能ではある
	 *  しかし③はBはAに参照「されて」いる、CはAを参照「して」いると、BとCが一覧表示される関連がない
	 */
	// TODO: 重すぎ...
	loggingWithColor("cyan", "2hoplink");
	// linkを持つ側のnote
	for (const baseNote of notes) {
		// 2個以上は出現させない
		const seen = new Set<string>(
			[
				// // おおもとのファイルと同じ場合は除外
				{ path: normalizePath(baseNote.path) },
				...baseNote.backLinks,
				...baseNote.metadata.links,
				...baseNote.metadata.embeds,
			].map((l) => normalizePath(l.path)),
		);

		process.stdout.write(`${baseNote.basename}`);
		process.stdout.write("\r");
		// note → link
		for (const link of [
			...baseNote.metadata.links,
			...baseNote.metadata.embeds,
		]) {
			// すでに計算されていたら何もしない
			if (baseNote.twoHopLinks?.find((thl) => thl.path === link.path)) continue;
			// .md以外の.**の場合は何もしない
			if (hasExtensionButNotMD(link.path)) continue;

			const isExists = noteLinkMap.has(normalizePath(link.path));

			// 再検索
			const twoHopNotes = notes.filter((_n) => {
				const nPath = normalizePath(_n.path);
				if (seen.has(nPath)) {
					return false;
				}

				const linkSet = noteLinkMap.get(nPath);
				const hasLink = linkSet?.has(link.path);

				if (hasLink) {
					seen.add(nPath);
				}

				return hasLink;
			});

			// twoHopLinksが空ならそもそも追加しない
			if (!twoHopNotes.length) continue;

			baseNote.twoHopLinks.push({
				links: twoHopNotes.map((t) => ({
					path: getLinkOrId(t.path, pathMap),
					title: t.basename,
					thumbnailPath: t.thumbnailPath,
				})),
				path: getLinkOrId(link.path, pathMap),
				title: link.title,
				isExists: isExists,
			});
		}
	}

	return notes;
};

/**
 * key: 元の名前、value: uid
 */
const createPathMap = (files: TNoteIndependence[]): PathMap => {
	const pathMap: PathMap = {};
	for (const file of files) {
		const id = idParser(file, file.metadata.frontmatter);

		if (id) {
			const pathName = normalizePath(path.join(file.path));
			pathMap[pathName] = normalizePath(path.join(id));
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

const createFolderFile = async (vault: TVault): Promise<void> => {
	const notes: {
		path: string;
		title: string;
	}[] = vault.notes.map((n) => {
		return {
			path: vault.pathMap[n.path] ?? n.path,
			title: n.metadata.frontmatter.title ?? n.basename,
		};
	});
	const folders = buildFileTree(notes);

	await writeFileRecursive(folderFilePath, JSON.stringify(folders));
	loggingWithColor("green", `COMPLETED!! >> ${folderFilePath}`);
};

export const createVaultFile = async (): Promise<TVault> => {
	loggingWithColor("cyan", "createFileTrees start");
	const fileTrees = createFileTrees(withAssetsDirPath);

	const fileNode: FileNode[] = [];
	function traverse(tree: FileTree[], currentPath: string[] = []) {
		for (const file of tree) {
			const newPath = [...currentPath, file.name];
			fileNode.push({
				name: file.name,
				absPath: normalizePath(
					path.join(...newPath.map((p) => p.replace(/\.md$/, ""))),
				),
			});

			if (file.type === "dir" && file.children) {
				traverse(file.children, newPath);
			}
		}
	}
	traverse(fileTrees);

	loggingWithColor("cyan", "createParsedTree start");
	const parsed = await createParsedTree(
		fileTrees,
		fileNode,
		withAssetsDirPath,
		"",
	);
	loggingWithColor("cyan", "flattenParsedTree start");
	const flattened = flattenParsedTree(parsed);
	loggingWithColor("cyan", "createPathMap start");
	const pathMap = createPathMap(flattened);

	const tiNotes = flattened
		.filter((f) => !isTestOnlyNote(f))
		.map((f) => ({
			...f,
			path: normalizePath(path.join(f.path)),
		}));
	loggingWithColor("cyan", "injectAllLinksToTNoteIndependence start");
	const tNotes = injectAllLinksToTNoteIndependence(tiNotes, pathMap);
	loggingWithColor("cyan", "createCreatedMap start");
	const createdMap = createCreatedMap(tNotes);

	return {
		notes: tNotes,
		assets: fileNode
			.filter((f) => hasExtensionButNotMD(f.absPath))
			.map((p) => ({
				basename: p.name,
				path: path.join(p.absPath),
			})),
		pathMap,
		createdMap,
	};
};

export const main = async () => {
	const vaultFile = await createVaultFile();
	writeFileRecursive(vaultMetadataFilePath, JSON.stringify(vaultFile));
	loggingWithColor("green", `COMPLETED!! >> ${vaultMetadataFilePath}`);

	await createFolderFile(vaultFile);
};

const [funcName] = process.argv.slice(2);
if (funcName === "main") main();
