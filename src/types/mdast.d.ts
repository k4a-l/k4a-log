import type { Literal } from "mdast";

interface WikiLinkData extends Data {
	isEmbed: boolean;
	type: "link" | "img" | "pdf" | "video" | "unknown";
	exists: boolean;
	alias: string;
	link: string;
	hChildren: { type: string; value: string }[];
	hName: "span" | "a";
	hProperties: {
		className?: string;
		href: string;
		title: string;
		alias?: string;
		type: WikiLinkData["type"];
		"is-embed"?: "true";
		size?: number;
		rootDirPath: string;
		assetsDirPath: string;
		// Array-like
		parentsLinks: string;
	};
}

interface WikiLink extends Literal {
	type: "wikiLink";
	embed?: boolean;
	data?: WikiLinkData;
	value: string;
}

interface Hashtag extends Literal {
	type: "hashtag";
}

declare module "mdast" {
	interface RootContentMap {
		wikiLink: WikiLink;
		hashtag: Hashtag;
	}
}
