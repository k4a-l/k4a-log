import type { VFileData } from "@/features/remark/frontmatter";

export type TLinkMetaData = {
	aliasTitle?: string;
	title: string;
	path: string;
};

type TEmbedMetaData = TLinkMetaData;

type TFrontMatterMetaData = VFileData["frontmatter"];

type THeadingMetaData = { text: string; level: number };

export type TListItemMetaData = {
	parentLineNumber: number;
	text: string;
	lineNumber: number;
	task?: " " | "x";
};

type TTagMetaData = {
	tag: string;
};

export type TPostMetaData = {
	embeds: TEmbedMetaData[];
	frontmatter: TFrontMatterMetaData;
	headings: THeadingMetaData[];
	links: TLinkMetaData[];
	listItems: TListItemMetaData[];
	tags: TTagMetaData[];
};

/** key:path, value:uid */
export type PathMap = Record<string, string | undefined>;

/**
 * ファイル単体で解決できる内容
 * 参考: https://docs.obsidian.md/Reference/TypeScript+API/CachedMetadata
 * obsidianではfileからCachedMetadataを取得するので分離されているがここでは一緒にしてしまう
 */
export type TPostIndependence = {
	/** 公式では他にnameがあるが、basename+extensionなので不要  */
	basename: string;
	extension: string;
	/**  rootPath基準でextensionなども含めた完全パス */
	path: string;
	/** stats、正直当てにならない気が... sizeはどうせ変換されるし、timeも容易に変わっちゃう */
	// stats: {
	// 	cMSecFromUnix: number;
	// 	mMSecFromUnix: number;
	// 	byteSize: number;
	// };
	metadata: TPostMetaData;
	thumbnailPath?: string;
};

type TPostLink = { path: string; title: string; thumbnailPath?: string };
export type TPost = TPostIndependence & {
	/** pathをキーにvaultObjectからtitleなどは取得できるが、使用時に楽なのでまとめちゃう */
	backLinks: TPostLink[];
	twoHopLinks: (TPostLink & { links: TPostLink[] })[];
};

export type YMMap = {
	[year: string]: {
		[month: string]: number;
	};
};

export type TVault = {
	posts: TPost[];
	pathMap: PathMap;
	createdMap: YMMap;
};
