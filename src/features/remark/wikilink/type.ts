import type { FileTree } from "./util";
import type { WikiLink } from "@/types/mdast";

export type WikiLinkOption = {
	assetPath: string;
	rootPath: string;
	fileTrees?: FileTree[];
	// currentPaths?: string[];
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
