import path from "path-browserify";

import { blogDirPath, workDirPath } from "@/features/metadata/constant";
import { strictEntries, strictFromEntries } from "@/utils/object";
import { normalizePath, pathSplit } from "@/utils/path";

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
	buy: { key: "buy", type: "string" } as const,
	dispose: { key: "dispose", type: "string" } as const,
	price: { key: "price", type: "number" } as const,
	status: { key: "status", type: "string" } as const,
} as const satisfies { [key: string]: { key: string; type: AllowedType } };

export type TFrontMatter = {
	[K in keyof typeof frontMatterKeys]?: (typeof frontMatterKeys)[K]["type"] extends "number"
		? number
		: string;
};

export type VFileData = {
	frontmatter?: TFrontMatter;
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

export const getFrontMatters = (obj: Record<string, unknown>): TFrontMatter => {
	const frontmatter: TFrontMatter = strictFromEntries(
		strictEntries(frontMatterKeys).flatMap(([key, { key: _, type }]) => {
			const value = getTypedKey(obj, key, type);
			if (!value) return [];
			return [
				[
					key,
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					value satisfies TFrontMatter[keyof TFrontMatter] as unknown as any,
				],
			];
		}),
	);

	return frontmatter;
};

const specialId = {
	"{dirname}": {
		matcher: (file) =>
			file.path.startsWith(normalizePath(path.join("/", blogDirPath))) ||
			file.path.startsWith(normalizePath(path.join("/", workDirPath))),
		parser: (file) => {
			const splitted = pathSplit(file.path);
			// foo/直下だったらそのまま
			if (splitted.length <= 3) return splitted.join("/");
			// foo/yyyy/等の場合は最後のディレクトリ名を使用
			return file.path.split(/\\|\//).slice(0, -1).join("/");
		},
	},
} satisfies {
	[key: string]: {
		parser: (file: { path: string }) => string;
		matcher: (file: { path: string }) => boolean;
	};
};

export const idParser = (
	file: { path: string },
	frontmatter: TFrontMatter | undefined,
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

	return normalizePath(idParsed);
};
