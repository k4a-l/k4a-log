"use client";
import { NextLink } from "@/components/Link/NextLink";
import { Button } from "@/park-ui/components/button";
import type { PickRequired } from "@/utils/type";
import { Hash, XIcon } from "lucide-react";
import { css } from "styled-system/css";
import { HStack, Stack } from "styled-system/jsx";
import { P, match } from "ts-pattern";
import { SearchResult } from "./SearchResult";
import { useHonoQuery } from "./hono";
import { type SearchQuery, getSearchPath } from "./util";

import { sortByItems } from "@/app/api/[[...route]]/search/constant";
import { Select, createListCollection } from "@/park-ui/components/select";
import { strictEntries, strictFromEntries } from "@/utils/object";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";
import { SearchBox } from "./SearchBox";

interface Item {
	label: string;
	value: string;
	disabled?: boolean;
}

const ButtonTag = (props: ComponentProps<typeof Button>) => (
	<Button
		size="sm"
		asChild
		py={1}
		px={2}
		colorPalette={"blue"}
		h={"1.5em"}
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
						gap={1}
						flexWrap={"wrap"}
						w="100%"
						className={css({
							bg: "white",
						})}
						rounded={"md"}
						p={2}
					>
						{hashTagList.map((tag) => (
							<ButtonTag
								key={tag}
								variant={selectedTag === tag ? "solid" : "subtle"}
								gap={0}
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
						w="auto"
						variant={"ghost"}
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
										<Select.Item key={item.value} item={item}>
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
