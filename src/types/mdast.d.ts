import type { Literal } from "mdast";

interface WikiLinkData extends Data {
	isEmbed: boolean;
	type: "link" | "img" | "pdf" | "unknown";
	exists: boolean;
	displayName: string;
	link: string;
	hChildren: { type: string; value: string }[];
	hName: "span" | "a";
	hProperties: {
		className?: string;
		style?: string;
		href: string;
		isEmbed?: "true";
	};
}

interface WikiLink extends Literal {
	type: "wikiLink";
	embed?: boolean;
	data?: WikiLinkData;
	value: string;
}

declare module "mdast" {
	interface RootContentMap {
		wikiLink: WikiLink;
	}
}
