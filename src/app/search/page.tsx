import { PageWithTransition } from "@/components/Common/pageWithTransition";
import { MyHead } from "@/components/Head";
import { getVaultObject } from "@/features/file/io";
import { Stack } from "styled-system/jsx";

import { SearchPresentation } from "./SearchPresentation";
import { type SearchQuery, searchPath } from "./util";

export type SearchParams = Promise<SearchQuery>;

export default async function Page({
	searchParams,
}: {
	searchParams: Record<keyof SearchQuery, string>;
}) {
	const { query, tag, page, created, sort, hasLink } = await searchParams;

	const vault = getVaultObject();

	const hashTagList: string[] = [
		...new Set(vault.notes.flatMap((p) => p.metadata.tags.map((t) => t.tag))),
	];
	const linkTagList: string[] = [
		...new Set(
			vault.notes.flatMap((p) =>
				[...p.metadata.links, ...p.metadata.embeds]
					.filter((t) => t.isTagLink)
					.map((l) => l.title),
			),
		),
	];
	const pageNum = page ? Number.parseInt(page) : 0;

	return (
		<PageWithTransition>
			<MyHead
				description={""}
				imagePath={undefined}
				keywords={[]}
				title={"検索"}
				url={searchPath}
			/>
			<Stack alignItems={"center"} h="full" w="full">
				<SearchPresentation
					hashTagList={hashTagList}
					linkTagList={linkTagList}
					searchQuery={{
						query: query ? decodeURIComponent(query) : undefined,
						tag: tag ? decodeURIComponent(tag) : undefined,
						page: Number.isNaN(pageNum) ? 0 : pageNum,
						created: created,
						sort: sort,
						hasLink: hasLink,
					}}
				/>
			</Stack>
		</PageWithTransition>
	);
}
