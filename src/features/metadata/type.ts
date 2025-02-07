import type { FrontMatter } from "@/features/remark/frontmatter";
import type { StrictOmit } from "ts-essentials";
import type { Position } from "unist";

export type TLinkMetaData = {
	aliasTitle?: string;
	title: string;
	path: string;
	position?: Position;
	isTagLink: boolean;
};

type TEmbedMetaData = TLinkMetaData;

type THeadingMetaData = { text: string; level: number };

export type TListItemMetaData = {
	parentLineNumber: number;
	text: string;
	lineNumber: number;
	task?: " " | "x";
	id: string;
};

export type TTagMetaData = {
	tag: string;
};

export type TNoteMetaData = {
	embeds: TEmbedMetaData[];
	frontmatter: StrictOmit<FrontMatter, "thumbnailPath">;
	headings: THeadingMetaData[];
	links: TLinkMetaData[];
	listItems: TListItemMetaData[];
	tags: TTagMetaData[];
};

/** key:path, value:uid */
export type PathMap = Record<string, string>;

/**
 * ファイル単体で解決できる内容
 * 参考: https://docs.obsidian.md/Reference/TypeScript+API/CachedMetadata
 * obsidianではfileからCachedMetadataを取得するので分離されているがここでは一緒にしてしまう
 */
export type TNoteIndependence = {
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
	metadata: TNoteMetaData;
	thumbnailPath?: string;
};

type TNoteLink = { path: string; title: string; thumbnailPath?: string };
export type TNote = TNoteIndependence & {
	/** pathをキーにvaultObjectからtitleなどは取得できるが、使用時に楽なのでまとめちゃう */
	backLinks: TNoteLink[];
	twoHopLinks: (TNoteLink & { links: TNoteLink[] })[];
};

export type YMMap = {
	[year: string]: {
		[month: string]: string[];
	};
};

export type TVault = {
	notes: TNote[];
	assets: { name: string; path: string }[];
	pathMap: PathMap;
	createdMap: YMMap;
};

export type MetaProps = { vault: TVault; note: TNote };
