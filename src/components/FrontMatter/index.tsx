import { Box, HStack } from "styled-system/jsx";

import type { VFileData } from "@/features/remark/frontmatter";
import { Link } from "@/park-ui/components/link";
import { stringToDate, toYYYYMMDD } from "@/utils/date";
import NextLink from "next/link";

const frontMatterKeys = {
	created: "created",
	updated: "updated",
	// tags: "array", // タグは普通に中のやつ使ってくれ...
	// author: "string", // 自分しかいない
	//ノート名でいいけど上書きしたい場合もあるかも...？）
	// title: "string",
};

export const FrontMatter = ({ frontmatter: frontMatter }: VFileData) => {
	const createdString = String(frontMatter?.[frontMatterKeys.created]);
	const createdDateMaybe = stringToDate(createdString);
	const updatedString = String(frontMatter?.[frontMatterKeys.updated]);
	const updatedDateMaybe = stringToDate(updatedString);
	const createdDateYMD =
		createdDateMaybe || updatedDateMaybe
			? toYYYYMMDD((createdDateMaybe ?? updatedDateMaybe) as Date)
			: undefined;
	const updateDateYMD =
		(createdDateMaybe ?? updatedDateMaybe)
			? toYYYYMMDD((createdDateMaybe ?? updatedDateMaybe) as Date)
			: undefined;

	return (
		<HStack justifyContent={"end"} fontSize={"sm"}>
			{createdDateYMD ? (
				<Box>
					作成日:
					<Link asChild color={"blue.10"} fontWeight={"bold"}>
						<NextLink href={`/search?query=created:${createdDateYMD}`}>
							{createdDateYMD}
						</NextLink>
					</Link>
				</Box>
			) : null}
			{updateDateYMD ? (
				<Box>
					作成日:
					<Link asChild color={"blue.10"} fontWeight={"bold"}>
						<NextLink href={`/search?query=created:${createdDateYMD}`}>
							{createdDateYMD}
						</NextLink>
					</Link>
				</Box>
			) : null}
		</HStack>
	);
};
