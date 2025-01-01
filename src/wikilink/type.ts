import type { HTMLProps } from "react";

export type WikiLinkOption = {
	aliasDivider?: string;
	pageResolver?: (str?: string) => string[];
	permalinks?: string[];
	markdownFolder?: string;
	newClassName?: string;
	wikiLinkClassName?: string;
	hrefTemplate?: (permalink: string) => string;
};

export type WikiLinkContentMap = {
	type: "wikiLink";
	children: Array<unknown>;
	data?:
		| {
				alias: string;
				hName: string;
				hChildren: { type: string; value: string }[];
				permalink: string;
				exists: boolean;
				hProperties: HTMLProps<""> & { className?: string; style?: string };
		  }
		| undefined;
	value: string;
};
