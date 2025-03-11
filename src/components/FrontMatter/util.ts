import { type VFileData, frontMatterKeys } from "@/features/remark/frontmatter";
import { stringToDate } from "@/utils/date";

export const getFileDate = ({
	frontmatter,
}: Pick<VFileData, "frontmatter">):
	| { created: Date; updated: Date }
	| undefined => {
	const createdDateMaybe = toMaybeDate(
		frontmatter?.[frontMatterKeys.created.key],
	);
	const updatedDateMaybe = toMaybeDate(
		frontmatter?.[frontMatterKeys.updated.key],
	);

	if (!createdDateMaybe && !updatedDateMaybe) {
		return undefined;
	}

	return {
		created: (createdDateMaybe ?? updatedDateMaybe) as Date,
		updated: (updatedDateMaybe ?? createdDateMaybe) as Date,
	};
};

export const toMaybeDate = (
	dateString: string | undefined,
): Date | undefined => {
	return dateString ? stringToDate(dateString) : undefined;
};

export const maybe = <T, V>(
	value: T | undefined,
	func: (value: T) => V,
): V | undefined => {
	return value ? func(value) : undefined;
};
