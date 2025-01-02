import * as fs from "node:fs";
import * as path from "node:path";
import type { WikiLinkOption } from "./type";

export const pathResolver = (
	_name: string,
	{
		permalinks,
		markdownFolder,
	}: { permalinks: string[]; markdownFolder?: string },
): ReturnType<Required<WikiLinkOption>["pageResolver"]> => {
	if (!_name || _name === "") return undefined;

	const extensionInfo = getWikiLinkExtension(_name);
	let name = _name;
	let heading = "";

	// 同一ページ内のアンカーリンク
	if (name.startsWith("#")) {
	}

	// HEADINGリンク
	if (!extensionInfo.extension && !name.startsWith("#") && name.match(/#/)) {
		[, heading] = name.split("#");
		name = name.replace(`#${heading}`, "");
	} else if (name.startsWith("#")) {
		name = name.toLowerCase();
	}

	if (permalinks || markdownFolder) {
		const link = permalinks?.find(
			(p) =>
				p === name ||
				(p.split("/").pop() === name &&
					permalinks?.includes(p.split("/").pop() ?? "")),
		);
		if (link) {
			if (heading) return `${link}#${heading.toLowerCase()}`.replace(/ /g, "-");
			return extensionInfo.extension ? link : link.replace(/ /g, "-");
		}
	}
	return extensionInfo.extension ? name : name.replace(/ /g, "-");
};

export type FileTree =
	| { type: "file"; name: string }
	| { type: "dir"; name: string; children: FileTree[] };

export const getFileTree = (dirPath: string): FileTree[] => {
	const tree: FileTree[] = [];
	const entries = fs.readdirSync(dirPath, { withFileTypes: true });

	for (const entry of entries) {
		if (entry.name === ".obsidian") continue;

		const fullPath = path.join(dirPath, entry.name);

		if (entry.isDirectory()) {
			tree.push({
				type: "dir",
				name: entry.name,
				children: getFileTree(fullPath),
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
