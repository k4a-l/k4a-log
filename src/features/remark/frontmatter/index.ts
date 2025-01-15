import { strictEntries, strictFromEntries } from "@/utils/object";
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
	uid: { key: "uid", type: "string" } as const,
	// tags: "array", // タグは普通に中のやつ使ってくれ...
	// author: "string", // 自分しかいない
	/** indexとか、値はindexにしたいけど別のタイトルをつけたい場合がある(uidの逆) */
	title: { key: "title", type: "string" } as const,
	desc: { key: "desc", type: "string" },
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
