import * as fs from "node:fs";
import * as path from "node:path";
import type { WikiLinkData } from "@/types/mdast";
import {} from "react/jsx-runtime";

// _startPathの最後の要素に拡張子が含まれていない場合は、最後の要素に.mdを結合したあたらしい配列を作る
// 拡張子が含まれている場合は、そのままの配列を使う
export const convertNoExtensionPathToMD = (_path: string[]): string[] => {
	const path = _path.slice(0, -1);
	const last = lastOfArr(_path);

	if (!last) return [];

	if (last?.match(/.*\..*/)) {
		path.push(last);
	} else {
		path.push(`${last}.md`);
	}
	return path.map((p) => {
		return decodeURIComponent(p);
	});
};

type FileNode = { absPaths: string[]; file: FileTree };
export function findClosest(
	fileTrees: FileTree[],
	_startPath: string[],
	_targetName: string,
): FileNode | undefined {
	// ツリー全体を探索し、すべてのパスを記録する
	const allPaths: FileNode[] = [];

	const targetName = decodeURIComponent(_targetName);
	const startPath = convertNoExtensionPathToMD(_startPath);

	function traverse(tree: FileTree[], currentPath: string[] = []) {
		for (const file of tree) {
			const newPath = [...currentPath, file.name];
			allPaths.push({ absPaths: newPath, file });

			if (file.type === "dir" && file.children) {
				traverse(file.children, newPath);
			}
		}
	}

	traverse(fileTrees);

	// 起点と対象を検索
	const start = allPaths.find(
		(item) => JSON.stringify(item.absPaths) === JSON.stringify(startPath),
	);
	if (!start) return undefined; // 起点が見つからなければ終了

	// パス指定の場合
	const targetNameSplit = targetName.split("/");
	if (targetNameSplit.length > 1) {
		const targetPathList = path
			.join(...startPath.slice(0, -1), ...targetNameSplit)
			.split("\\");

		const target = allPaths.find(
			(item) =>
				JSON.stringify(item.absPaths.map((p) => p.replace(/\.md$/, ""))) ===
				JSON.stringify(targetPathList),
		);
		return target;
	}

	const targetCandidates = allPaths.filter(
		(item) => item.file.name.replace(/\.md$/, "") === targetName,
	);
	if (targetCandidates.length === 0) return undefined; // 対象が見つからなければ終了

	// 距離を計算して最も近い対象を見つける
	let closest: ({ distance: number } & FileNode) | null = null;

	for (const candidate of targetCandidates) {
		const targetPath = candidate.absPaths;

		// 共通部分を求める（距離計算のため）
		let commonLength = 0;
		for (let i = 0; i < Math.min(startPath.length, targetPath.length); i++) {
			if (startPath[i] === targetPath[i]) {
				commonLength++;
			} else {
				break;
			}
		}

		// 距離 = 上方向の移動回数 + 下方向の移動回数
		const distance =
			startPath.length - commonLength + (targetPath.length - commonLength);
		if (!closest || distance < closest.distance) {
			closest = {
				distance,
				file: candidate.file,
				absPaths: candidate.absPaths,
			};
		}
	}

	return closest ? closest : undefined;
}

export const pathResolver = ({
	linkName: _linkName,
	currentPaths,
	fileTrees,
}: {
	linkName: string;
	currentPaths: string[];
	fileTrees: FileTree[];
}): string | undefined => {
	if (!_linkName) return undefined;

	const extensionInfo = getWikiLinkExtension(_linkName);

	// 同一ページ内のアンカーリンク
	if (_linkName.startsWith("#")) {
		return `#${toHeadingSlug(_linkName.replace("#", ""))}`;
	}

	let link = _linkName;
	let headingContent = "";
	// HEADINGリンク
	if (!extensionInfo.extension && link.match(/#/)) {
		headingContent = link.split("#")[1] ?? "";
		link = link.replace(`#${headingContent}`, "");
	}

	const file = findClosest(fileTrees, currentPaths, link);

	if (file) {
		const absPath = path.join(...file.absPaths);
		if (headingContent) {
			return `${absPath}#${toHeadingSlug(headingContent)}`;
		}
		return absPath;
	}

	return undefined;
};

export type FileTree =
	| { type: "file"; name: string }
	| { type: "dir"; name: string; children: FileTree[] };

export const createFileTrees = (dirPath: string): FileTree[] => {
	const tree: FileTree[] = [];
	const entries = fs.readdirSync(dirPath, { withFileTypes: true });

	for (const entry of entries) {
		if (entry.name === ".obsidian") continue;

		const fullPath = path.join(dirPath, entry.name);

		if (entry.isDirectory()) {
			tree.push({
				type: "dir",
				name: entry.name,
				children: createFileTrees(fullPath),
			});
		} else {
			tree.push({ type: "file", name: entry.name });
		}
	}

	return tree;
};

export const imageExtensions = [
	/\.jpe?g$/,
	/\.a?png$/,
	/\.webp$/,
	/\.avif$/,
	/\.gif$/,
	/\.svg$/,
	/\.bmp$/,
	/\.ico$/,
];
export function getWikiLinkExtension(value: string | undefined): {
	type: WikiLinkData["type"];
	extension: string;
} {
	const pdfExtensions = [/\.pdf$/];

	const videoExtensions = [/\.mp4$/, /\.avi$/, /\.mkv$/, /\.mov$/, /\.wmv$/];

	if (!value) return { type: "link", extension: "" };
	const strippedExtension =
		value.match(/\.[0-9a-z]{1,4}$/gi)?.[0].replace(".", "") ?? "";

	const isMatchImg = imageExtensions.some((r) => value.match(r));
	if (isMatchImg) {
		return { type: "img", extension: strippedExtension };
	}

	const isMatchPdf = pdfExtensions.some((r) => value.match(r));
	if (isMatchPdf) {
		return { type: "pdf", extension: strippedExtension };
	}

	const isMatchVideo = videoExtensions.some((r) => value.match(r));
	if (isMatchVideo) {
		return { type: "video", extension: strippedExtension };
	}

	const isMatchAnyExtension = value.match(/\.([0-9a-z]{1,4})$/)?.[0];
	if (isMatchAnyExtension) {
		return { type: "unknown", extension: strippedExtension };
	}

	return { type: "link", extension: strippedExtension };
}

export function lastOfArr<T>(stack: T[]) {
	return stack[stack.length - 1];
}

import GithubSlugger from "github-slugger";

export const toHeadingSlug = (str: string) => {
	const slugs = new GithubSlugger();
	return slugs.slug(str);
};
