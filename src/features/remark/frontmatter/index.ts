import path from "node:path";
import { postDirPath } from "@/constants/path";
import { blogDirPath } from "@/features/metadata/constant";
import { strictEntries, strictFromEntries } from "@/utils/object";
import { normalizePath } from "@/utils/path";
import type { Result } from "mdast-util-toc";

type YAMLValue = string | number | boolean | null | YAMLObject | YAMLArray;
type AllowedType =
	| "string"
	| "number"
	| "boolean"
	| "null"
	| "object"
	| "array";

interface YAMLObject {
	[key: string]: YAMLValue;
}
type YAMLArray = YAMLValue[];

export const frontMatterKeys = {
	created: { key: "created", type: "string" } as const,
	updated: { key: "updated", type: "string" } as const,
	/** ノート名とは別のpathを割り当てたい場合（ノート全体で一意である前提なので、重複がある場合は上書きされる） */
	id: { key: "id", type: "string" } as const,
	// tags: "array", // タグは普通に中のやつ使ってくれ...
	// author: "string", // 自分しかいない
	/** indexとか、値はindexにしたいけど別のタイトルをつけたい場合がある(uidの逆) */
	title: { key: "title", type: "string" } as const,
	description: { key: "description", type: "string" },
	thumbnailPath: { key: "thumbnailPath", type: "string" },
} satisfies { [key: string]: { key: string; type: AllowedType } };

type FrontMatter = Partial<
	Record<
		keyof typeof frontMatterKeys,
		{
			string: string;
			array: YAMLArray;
			number: number;
			boolean: boolean;
			object: YAMLObject;
			null: null;
		}[(typeof frontMatterKeys)[keyof typeof frontMatterKeys]["type"]]
	>
>;

export type VFileData = {
	frontmatter?: FrontMatter;
	toc: Result["map"];
};

// 型安全に値を取得する関数
export const getTypedKey = <T extends AllowedType>(
	obj: Record<string, unknown>,
	key: string,
	allowedType: T,
):
	| {
			string: string;
			array: YAMLArray;
			number: number;
			boolean: boolean;
			object: YAMLObject;
			null: undefined;
	  }[T]
	| undefined => {
	const value = obj[key];
	if (!value) return undefined;

	switch (allowedType) {
		case "array":
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			return Array.isArray(value) ? (value as any) : undefined;
		case "null":
			return value === null ? value : undefined;
		default:
			// biome-ignore lint/suspicious/useValidTypeof: <explanation>
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			return typeof value === allowedType ? (value as any) : undefined;
	}
};

export const getFrontMatters = (obj: Record<string, unknown>): FrontMatter => {
	const frontmatter: FrontMatter = strictFromEntries(
		strictEntries(frontMatterKeys).flatMap(
			([key, { key: _, type }]):
				| [[keyof FrontMatter, FrontMatter[keyof FrontMatter]]]
				| [] => {
				const value = getTypedKey(obj, key, type);
				if (!value) return [];
				return [[key, value]];
			},
		),
	);

	return frontmatter;
};

const specialId = {
	"{dirname}": {
		matcher: (file) =>
			// TODO: postから始まるpathと、それ以降から始まるpathが混在している
			file.path.startsWith(normalizePath(path.join("/", blogDirPath))) ||
			file.path.startsWith(
				normalizePath(path.join("/", postDirPath, blogDirPath)),
			),
		parser: (file) => file.path.split(/\\|\//).slice(0, -1).join("/"),
	},
} satisfies {
	[key: string]: {
		parser: (file: { path: string }) => string;
		matcher: (file: { path: string }) => boolean;
	};
};

export const idParser = (
	file: { path: string },
	frontmatter: FrontMatter | undefined,
): string | undefined => {
	const idRaw = frontmatter?.[frontMatterKeys.id.key];

	const id =
		strictEntries(specialId).find(([_, { matcher }]) => matcher(file))?.[0] ??
		idRaw;

	if (!id) return;
	if (typeof id !== "string") return;

	const idParser = strictEntries(specialId).find(([key, _]) => id === key)?.[1]
		.parser;

	const idParsed = idParser ? idParser(file) : id;

	return normalizePath(path.join(idParsed));
};
