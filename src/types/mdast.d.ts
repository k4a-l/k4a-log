import type { Literal } from "mdast";

interface WikiLinkData extends Data {
	isEmbed: boolean;
	isTagLink: boolean;
	type: "link" | "img" | "pdf" | "video" | "unknown";
	exists: boolean;
	alias: string;
	link: string;
	hChildren: { type: string; value: string }[];
	hName: "span" | "wikilink";
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
		isTagLink?: "true";
		isDeadLink?: "true";
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

interface ParagraphWrap extends Literal {
	type: "paragraphWrap";
}

declare module "mdast" {
	interface RootContentMap {
		wikiLink: WikiLink;
		hashtag: Hashtag;
		paragraphWrap: ParagraphWrap;
	}
}
