import type { TNoteIndependence, TTagMetaData } from "@/features/metadata/type";
import type { NoteCondition } from "./constant";
import { normalizePath } from "@/utils/path";

export const isContainNGWords = (str: string, ngWords: string[]): boolean => {
	return ngWords.some((word) => str.match(word));
};

// https://github.com/k4a-l/obsidian-dymamic-classname/blob/a5cca4615a6736010e7859ecff63dc065f59be2c/main.ts#L120
export const isMatchNodeCondition = (
	note: Pick<TNoteIndependence, "basename" | "path"> & {
		metadata: { tags: TTagMetaData[]; frontmatter: Record<string, unknown> };
	},
	cond: NoteCondition,
): boolean => {
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
