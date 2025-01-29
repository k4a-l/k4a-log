import { PenIcon, RotateCwIcon } from "lucide-react";

import { getSearchPath } from "@/app/search/util";
import { NextLink } from "@/components/Link/NextLink";
import { Link } from "@/park-ui/components/link";
import { toYYYYMMDD } from "@/utils/date";
import { Box, HStack } from "styled-system/jsx";

import { getFileDate } from "./util";

import type { VFileData } from "@/features/remark/frontmatter";

export const FrontMatter = ({
	frontmatter,
}: Pick<VFileData, "frontmatter">) => {
	const fileDate = getFileDate({ frontmatter });
	if (!fileDate) return null;

	const { created, updated } = fileDate;

	const createdDateYMD = toYYYYMMDD((created || updated) as Date);
	const updateDateYMD = toYYYYMMDD((created || updated) as Date);

	return (
		<HStack alignItems={"start"} fontSize={"0.8em"} justifyContent={"end"}>
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
					{/* <Link asChild color={"blue.10"} gap={1}> */}
					{/* <NextLink href={getSearchPath({ created: createdDateYMD })}> */}
					<RotateCwIcon height={"1em"} width={"1em"} />
					{updateDateYMD}
					{/* </NextLink> */}
					{/* </Link> */}
				</HStack>
			) : null}
		</HStack>
	);
};
