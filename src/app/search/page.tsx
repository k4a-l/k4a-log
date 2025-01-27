import { PageWithTransition } from "@/components/Common/pageWithTransition";
import { getVaultObject } from "@/features/file/io";
import { IS_PRODUCTION } from "@/utils/env";
import { isTestDirPath } from "@/utils/path";
import { Stack } from "styled-system/jsx";
import { SearchPresentation } from "./SearchPresentation";
import type { SearchQuery } from "./util";

export type SearchParams = Promise<SearchQuery>;

export default async function Page({
	searchParams,
}: {
	searchParams: Record<keyof SearchQuery, string>;
}) {
	const { query, tag, page, created, sort } = await searchParams;

	const vault = getVaultObject();

	const hashTagList: string[] = [
		...new Set(
			vault.posts
				.filter((p) => !(IS_PRODUCTION && isTestDirPath(p.path)))
				.flatMap((p) => p.metadata.tags.map((t) => t.tag)),
		),
	];
	const pageNum = page ? Number.parseInt(page) : 0;

	return (
		<PageWithTransition>
			<Stack alignItems={"center"} w="full" h="full">
				<SearchPresentation
					query={query ? decodeURIComponent(query) : undefined}
					tag={tag ? decodeURIComponent(tag) : undefined}
					page={Number.isNaN(pageNum) ? 0 : pageNum}
					created={created}
					sort={sort}
					hashTagList={hashTagList}
				/>
			</Stack>
		</PageWithTransition>
	);
}
