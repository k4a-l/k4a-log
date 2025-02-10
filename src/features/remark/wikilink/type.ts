import type { PathMap } from "@/features/metadata/type";
import type { FileMap, FileNode } from "./util";
import type { WikiLink } from "@/types/mdast";

export type WikiLinkOption = {
	assetPath: string;
	notes: FileNode[];
	fileMap: FileMap;
	pathMap: PathMap;
	/** 循環参照を防ぐためのもの */
	parentsLinks: string[];
	classNames?: {
		deadLink?: string;
		wikiLink?: string;
	};
};

export type WikiLinkContentMap = {
	type: WikiLink["type"];
	children: Array<unknown>;
	data?: WikiLink["data"] | undefined;
	value: WikiLink["value"];
};
