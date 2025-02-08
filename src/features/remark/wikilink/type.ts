import type { FileMap, FileNode } from "./util";
import type { WikiLink } from "@/types/mdast";

export type WikiLinkOption = {
	assetPath: string;
	notes: FileNode[];
	fileMap: FileMap;
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
