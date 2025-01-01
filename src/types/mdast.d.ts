import type { Literal } from "mdast";

interface WikiLink extends Literal {
	type: "wikiLink";
	embed?: boolean;
	data?:
		| Partial<{
				alias: string;
				hName: string;
				hChildren: { type: string; value: string }[];
				permalink: string;
				exists: boolean;
				hProperties: HTMLProps<""> & { className?: string; style?: string };
		  }>
		| undefined;
	value: string;
}

declare module "mdast" {
	interface RootContentMap {
		wikiLink: WikiLink;
	}
}
