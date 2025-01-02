import * as fs from "node:fs";
import * as path from "node:path";

type FileNode = { absPaths: string[]; file: FileTree };
export function findClosest(
	fileTrees: FileTree[],
	startPath: string[],
	targetName: string,
): FileNode | undefined {
	// ツリー全体を探索し、すべてのパスを記録する
	const allPaths: FileNode[] = [];

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
	currentPathList,
	fileTrees,
}: {
	linkName: string;
	currentPathList: string[];
	fileTrees: FileTree[];
}): string | undefined => {
	if (!_linkName) return undefined;

	const extensionInfo = getWikiLinkExtension(_linkName);

	// 同一ページ内のアンカーリンク
	if (_linkName.startsWith("#")) {
		return _linkName;
	}

	let link = _linkName;
	let heading = "";
	// HEADINGリンク
	if (!extensionInfo.extension && link.match(/#/)) {
		[, heading] = link.split("#");
		link = link.replace(`#${heading}`, "");
	}

	const path = findClosest(fileTrees, currentPathList, link);

	if (path) {
		if (heading) return `${link}#${heading.toLowerCase()}`.replace(/ /g, "-");
		return extensionInfo.extension ? link : link.replace(/ /g, "-");
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

export function getWikiLinkExtension(value: string | undefined): {
	type: "img" | "pdf" | "unknown" | "link";
	extension: string;
} {
	const imageExtensions = [
		/\.jpe?g$/,
		/\.a?png$/,
		/\.webp$/,
		/\.avif$/,
		/\.gif$/,
		/\.svg$/,
		/\.bmp$/,
		/\.ico$/,
	];
	const pdfExtensions = [/\.pdf$/];

	if (!value) return { type: "link", extension: "" };
	const strippedExtension =
		value.match(/\.[0-9a-z]{1,4}$/gi)?.[0].replace(".", "") ?? "";

	const isMatchImg = value.match(
		imageExtensions.filter((r) => value.match(r))[0],
	)?.[0];
	if (isMatchImg) {
		return { type: "img", extension: strippedExtension };
	}

	const isMatchPdf = value.match(
		pdfExtensions.filter((r) => value.match(r))[0],
	)?.[0];
	if (isMatchPdf) {
		return { type: "pdf", extension: strippedExtension };
	}

	return { type: "unknown", extension: strippedExtension };
}

export function lastOfArr<T>(stack: T[]) {
	return stack[stack.length - 1];
}
