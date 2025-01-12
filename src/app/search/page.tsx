import { PageWithTransition } from "@/components/Common/pageWithTransition";
import { getVaultObject } from "@/features/file/io";
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

	const vault = await getVaultObject();

	const hashTagList: string[] = [
		...new Set(vault.posts.flatMap((p) => p.metadata.tags.map((t) => t.tag))),
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
