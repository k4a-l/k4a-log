import {
	JapaneseYenIcon,
	PenIcon,
	RotateCwIcon,
	ShoppingCartIcon,
} from "lucide-react";

import { getSearchPath } from "@/app/search/util";
import { NextLink } from "@/components/Link/NextLink";
import { Link } from "@/park-ui/components/link";
import { toYYYYMMDD } from "@/utils/date";
import { Box, HStack } from "styled-system/jsx";

import { getFileDate, maybe, toMaybeDate } from "./util";

import type { TFrontMatter } from "@/features/remark/frontmatter";

const FileDate = ({ frontmatter }: { frontmatter: TFrontMatter }) => {
	const fileDate = getFileDate({ frontmatter });
	if (!fileDate) return null;

	const { created, updated } = fileDate;

	const createdDateYMD = toYYYYMMDD((created || updated) as Date);
	const updateDateYMD = toYYYYMMDD((created || updated) as Date);
	return (
		<>
			{createdDateYMD ? (
				<Box>
					<Link asChild color={"blue.10"} gap={1}>
						<NextLink href={getSearchPath({ created: createdDateYMD })}>
							<PenIcon />
							{createdDateYMD}
						</NextLink>
					</Link>
				</Box>
			) : null}
			{updateDateYMD ? (
				<HStack color="gray.10" fontSize={"1em"} gap={1}>
					<RotateCwIcon height={"1em"} width={"1em"} />
					{updateDateYMD}
				</HStack>
			) : null}
		</>
	);
};

export const FrontMatter = ({ frontmatter }: { frontmatter: TFrontMatter }) => {
	const buyDateYMD = maybe(toMaybeDate(frontmatter.buy), toYYYYMMDD);
	const yenPrice = Number(frontmatter.price);

	return (
		<HStack alignItems={"start"} fontSize={"0.8em"} justifyContent={"end"}>
			<FileDate frontmatter={frontmatter} />

			{buyDateYMD ? (
				<HStack color="gray.10" fontSize={"1em"} gap={1}>
					<ShoppingCartIcon height={"1em"} width={"1em"} />
					{buyDateYMD}
				</HStack>
			) : null}

			{yenPrice ? (
				<HStack color="gray.10" fontSize={"1em"} gap={0}>
					<JapaneseYenIcon height={"1em"} width={"1em"} />
					{yenPrice}
				</HStack>
			) : null}
		</HStack>
	);
};
