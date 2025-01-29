"use client";
import { CheckIcon, ChevronsUpDownIcon, Hash, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { P, match } from "ts-pattern";

import { sortByItems } from "@/app/api/[[...route]]/search/constant";
import { NextLink } from "@/components/Link/NextLink";
import { Button } from "@/park-ui/components/button";
import { Select, createListCollection } from "@/park-ui/components/select";
import { strictEntries, strictFromEntries } from "@/utils/object";
import { css } from "styled-system/css";
import { HStack, Stack } from "styled-system/jsx";

import { useHonoQuery } from "./hono";
import { SearchBox } from "./SearchBox";
import { SearchResult } from "./SearchResult";
import { type SearchQuery, getSearchPath } from "./util";

import type { PickRequired } from "@/utils/type";
import type { ComponentProps, ReactNode } from "react";

interface Item {
	label: string;
	value: string;
	disabled?: boolean;
}

const ButtonTag = (props: ComponentProps<typeof Button>) => (
	<Button
		asChild
		colorPalette={"blue"}
		h={"1.5em"}
		px={2}
		py={1}
		size="sm"
		textDecoration={"none"}
		{...props}
	/>
);

export const SearchPresentation = ({
	hashTagList,
	searchQuery,
}: {
	hashTagList: string[];
	searchQuery: PickRequired<SearchQuery, "page">;
}) => {
	const { query, tag, page, created, sort, hasLink } = searchQuery;

	const result = useHonoQuery(
		"search",
		strictFromEntries(
			strictEntries(searchQuery).map(([k, v]) => [k, v?.toString()]),
		),
	);

	const router = useRouter();

	const selectedTag = hashTagList.find((_t) => _t === tag);

	const sortBy = sortByItems.find((i) => i.value === sort) ?? sortByItems[0];

	const collection = createListCollection<Item>({
		items: sortByItems,
	});

	return (
		<>
			<Stack maxW={"max(1000px,100%)"} w={"min(1000px,100%)"}>
				<SearchBox />
				<HStack>
					{strictEntries(searchQuery).map(([k, v]) => {
						return (
							match(k)
								.returnType<ReactNode>()
								// 他の場所で表示するのでnull
								.with("query", () => null)
								.with("tag", () => null)
								.with("includesTests", () => null)
								.with("sort", () => null)
								.with("page", () => null)
								// 以下個別
								.with(P.union("created", "hasLink"), () => (
									<ButtonTag key={k}>
										<NextLink
											href={getSearchPath({
												...searchQuery,
												[k]: undefined,
											})}
										>
											{k}:{v}
											<XIcon />
										</NextLink>
									</ButtonTag>
								))
								.exhaustive()
						);
					})}
				</HStack>

				{hashTagList.length > 0 && (
					<HStack
						className={css({
							bg: "white",
						})}
						flexWrap={"wrap"}
						gap={1}
						p={2}
						rounded={"md"}
						w="100%"
					>
						{hashTagList.map((tag) => (
							<ButtonTag
								gap={0}
								key={tag}
								variant={selectedTag === tag ? "solid" : "subtle"}
							>
								<NextLink
									href={getSearchPath({
										...searchQuery,
										tag: tag === selectedTag ? "" : tag,
									})}
								>
									<Hash size={"1em"} />
									{tag}
								</NextLink>
							</ButtonTag>
						))}
					</HStack>
				)}

				<HStack justifyContent={"end"}>
					<Select.Root
						collection={collection}
						defaultValue={[sortBy.value]}
						onValueChange={(e) => {
							router.push(
								getSearchPath({ query, tag, page, sort: e.items[0].value }),
							);
						}}
						positioning={{ sameWidth: true }}
						size={"sm"}
						variant={"ghost"}
						w="auto"
					>
						<Select.Control>
							<Select.Trigger>
								<Select.ValueText placeholder="並び替え" />
								<ChevronsUpDownIcon />
							</Select.Trigger>
						</Select.Control>
						<Select.Positioner>
							<Select.Content>
								<Select.ItemGroup>
									{collection.items.map((item) => (
										<Select.Item item={item} key={item.value}>
											<Select.ItemText>{item.label}</Select.ItemText>
											<Select.ItemIndicator>
												<CheckIcon />
											</Select.ItemIndicator>
										</Select.Item>
									))}
								</Select.ItemGroup>
							</Select.Content>
						</Select.Positioner>
					</Select.Root>
				</HStack>
				<SearchResult {...result} page={page} searchQuery={searchQuery} />
			</Stack>
		</>
	);
};
