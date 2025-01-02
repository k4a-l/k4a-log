import type { WikiLink } from "@/types/mdast";

export type WikiLinkOption = {
	aliasDivider?: string;
	pageResolver?: (str?: string) => string | undefined;
	permalinks?: string[];
	markdownFolder?: string;
	newClassName?: string;
	wikiLinkClassName?: string;
	hrefTemplate?: (permalink: string) => string;
};

export type WikiLinkContentMap = {
	type: WikiLink["type"];
	children: Array<unknown>;
	data?: WikiLink["data"] | undefined;
	value: WikiLink["value"];
};
