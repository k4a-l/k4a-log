import { type VFileData, frontMatterKeys } from "@/features/remark/frontmatter";
import { stringToDate } from "@/utils/date";

export const getFileDate = ({
	frontmatter,
}: Pick<VFileData, "frontmatter">):
	| { created: Date; updated: Date }
	| undefined => {
	const createdString = frontmatter?.[frontMatterKeys.created.key];
	const createdDateMaybe = createdString
		? stringToDate(String(createdString))
		: null;
	const updatedString = frontmatter?.[frontMatterKeys.updated.key];
	const updatedDateMaybe = updatedString
		? stringToDate(String(updatedString))
		: null;

	if (!createdDateMaybe && !updatedDateMaybe) {
		return undefined;
	}

	return {
		created: (createdDateMaybe ?? updatedDateMaybe) as Date,
		updated: (updatedDateMaybe ?? createdDateMaybe) as Date,
	};
};
