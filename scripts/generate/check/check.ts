import { normalizePath } from "@/utils/path";

import type { NoteCondition } from "./constant";
import type { TNoteIndependence, TTagMetaData } from "@/features/metadata/type";

export const isContainNGWords = (
	str: string,
	ngWords: string[],
	safeWords?: string[],
): boolean => {
	const overWriteStr = safeWords?.join("|");
	const overWriteReg = new RegExp(`(${overWriteStr})`, "g");
	const processedStr = str.replace(overWriteReg, "");

	return ngWords.some((word) => processedStr.match(word));
};

const splitByPosNeg = (arr: string[]): { pos: string[]; neg: string[] } => {
	const positive = arr.flatMap((t) => (t.startsWith("!") ? [] : [t]));
	const negative = arr.flatMap((t) =>
		t.startsWith("!") ? t.replace(/^!/, "") : [],
	);

	return { pos: positive, neg: negative };
};

// https://github.com/k4a-l/obsidian-dymamic-classname/blob/a5cca4615a6736010e7859ecff63dc065f59be2c/main.ts#L120
export const isMatchNodeCondition = (
	note: Pick<TNoteIndependence, "basename" | "path"> & {
		metadata: { tags: TTagMetaData[]; frontmatter: Record<string, unknown> };
	},
	cond: NoteCondition,
): boolean => {
	const tagsSplit = splitByPosNeg(cond.tags ?? []);
	const pathsSplit = splitByPosNeg(cond.paths ?? []);
	const titleSplit = splitByPosNeg(cond.titles ?? []);

	const negativeMatch =
		tagsSplit.neg.some((tag) =>
			note.metadata.tags.find((t) => t.tag === tag),
		) ||
		pathsSplit.neg.some((p) =>
			normalizePath(note.path).startsWith(normalizePath(p)),
		) ||
		titleSplit.neg.some((t) => note.basename.includes(t));

	if (negativeMatch) {
		return false;
	}

	if (cond.tags?.some((tag) => note.metadata.tags.find((t) => t.tag === tag))) {
		return true;
	}
	if (
		cond.paths?.some((p) =>
			normalizePath(note.path).startsWith(normalizePath(p)),
		)
	) {
		return true;
	}
	if (cond.titles?.some((t) => note.basename.includes(t))) {
		return true;
	}

	type SingleValue = string | number | boolean;
	const isSingleValue = (v: unknown): v is SingleValue =>
		typeof v === "string" || typeof v === "number" || typeof v === "boolean";

	const isMatch = (v1: SingleValue, v2: SingleValue) => {
		return v1.toString() === v2.toString();
	};

	const frontmatter = note.metadata.frontmatter as Record<string, unknown>;

	if (
		Object.entries(cond?.frontmatter ?? {}).some(([sKey, sValue]) => {
			const fValue = frontmatter?.[sKey];
			if (isSingleValue(sValue)) {
				if (isSingleValue(fValue)) {
					return isMatch(sValue, fValue);
				}
				if (Array.isArray(fValue)) {
					return fValue.some((v) => isMatch(sValue, v));
				}
			} else if (Array.isArray(sValue)) {
				if (isSingleValue(fValue)) {
					return sValue.some((v) => isMatch(v, fValue));
				}
				if (Array.isArray(fValue)) {
					return sValue.some((v) => fValue.some((f) => isMatch(v, f)));
				}
			}
		})
	) {
		return true;
	}

	return false;
};
