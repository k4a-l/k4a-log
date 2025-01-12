import { Box, HStack } from "styled-system/jsx";

import { getSearchPath } from "@/app/search/util";
import { NextLink } from "@/components/Link/NextLink";
import type { VFileData } from "@/features/remark/frontmatter";
import { Link } from "@/park-ui/components/link";
import { toYYYYMMDD } from "@/utils/date";
import { PenIcon, RotateCwIcon } from "lucide-react";
import { getFileDate } from "./util";

export const FrontMatter = ({
	frontmatter,
}: Pick<VFileData, "frontmatter">) => {
	const fileDate = getFileDate({ frontmatter });
	if (!fileDate) return null;

	const { created, updated } = fileDate;

	const createdDateYMD = toYYYYMMDD((created || updated) as Date);
	const updateDateYMD = toYYYYMMDD((created || updated) as Date);

	return (
		<HStack justifyContent={"end"} fontSize={"0.8em"} alignItems={"start"}>
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
				<HStack fontSize={"1em"} gap={1} color="gray.10">
					{/* <Link asChild color={"blue.10"} gap={1}> */}
					{/* <NextLink href={getSearchPath({ created: createdDateYMD })}> */}
					<RotateCwIcon width={"1em"} height={"1em"} />
					{updateDateYMD}
					{/* </NextLink> */}
					{/* </Link> */}
				</HStack>
			) : null}
		</HStack>
	);
};
