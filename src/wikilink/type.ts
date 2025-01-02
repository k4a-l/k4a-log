import type { WikiLink } from "@/types/mdast";
import type { FileTree } from "./util";

export type WikiLinkOption = {
	fileTrees?: FileTree[];
	currentPaths?: string[];
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
