import { Box, HStack } from "styled-system/jsx";

import { NextLink } from "@/components/Link/NextLink";
import type { VFileData } from "@/features/remark/frontmatter";
import { Link } from "@/park-ui/components/link";
import { stringToDate, toYYYYMMDD } from "@/utils/date";
import { PenIcon, RotateCwIcon } from "lucide-react";

const frontMatterKeys = {
	created: "created",
	updated: "updated",
	// tags: "array", // タグは普通に中のやつ使ってくれ...
	// author: "string", // 自分しかいない
	//ノート名でいいけど上書きしたい場合もあるかも...？）
	// title: "string",
};

export const FrontMatter = ({
	frontmatter,
}: Pick<VFileData, "frontmatter">) => {
	const createdString = frontmatter?.[frontMatterKeys.created];
	const createdDateMaybe = createdString
		? stringToDate(String(createdString))
		: null;
	const updatedString = frontmatter?.[frontMatterKeys.updated];
	const updatedDateMaybe = updatedString
		? stringToDate(String(updatedString))
		: null;

	const createdDateYMD =
		createdDateMaybe || updatedDateMaybe
			? toYYYYMMDD((createdDateMaybe || updatedDateMaybe) as Date)
			: undefined;
	const updateDateYMD =
		createdDateMaybe || updatedDateMaybe
			? toYYYYMMDD((createdDateMaybe || updatedDateMaybe) as Date)
			: undefined;

	if (!createdDateYMD && !updateDateYMD) {
		return null;
	}

	return (
		<HStack justifyContent={"end"} fontSize={"0.8em"}>
			{createdDateYMD ? (
				<Box>
					<Link asChild color={"blue.10"} gap={1}>
						<NextLink href={`/search?query=created:${createdDateYMD}`}>
							<PenIcon />
							{createdDateYMD}
						</NextLink>
					</Link>
				</Box>
			) : null}
			{updateDateYMD ? (
				<Box>
					<Link asChild color={"blue.10"} gap={1}>
						<NextLink href={`/search?query=updated:${createdDateYMD}`}>
							<RotateCwIcon />
							{updateDateYMD}
						</NextLink>
					</Link>
				</Box>
			) : null}
		</HStack>
	);
};
