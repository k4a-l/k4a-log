"use client";
import { NextLink } from "@/components/Link/NextLink";
import { Button } from "@/park-ui/components/button";
import type { PickRequired } from "@/utils/type";
import { Hash } from "lucide-react";
import { css } from "styled-system/css";
import { HStack, Stack } from "styled-system/jsx";
import { SearchResult } from "./SearchResult";
import { useHonoQuery } from "./hono";
import { type SearchQuery, getSearchPath } from "./util";

import { sortByItems } from "@/app/api/[[...route]]/search/constant";
import { Select, createListCollection } from "@/park-ui/components/select";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { SearchBox } from "./SearchBox";

interface Item {
	label: string;
	value: string;
	disabled?: boolean;
}

export const SearchPresentation = ({
	query,
	tag,
	page,
	created,
	sort,
	hashTagList,
	hasLink,
}: PickRequired<SearchQuery, "page"> & { hashTagList: string[] }) => {
	const result = useHonoQuery("search", {
		query,
		tag,
		created,
		page: page.toString(),
		sort,
		hasLink,
	});

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
							<Button
								size="sm"
								asChild
								py={1}
								px={2}
								colorPalette={"blue"}
								key={tag}
								variant={selectedTag === tag ? "solid" : "subtle"}
								h={"1.5em"}
								textDecoration={"none"}
								gap={0}
							>
								<NextLink
									href={
										tag === selectedTag
											? getSearchPath({ tag: "", query, page })
											: getSearchPath({ tag, query, page })
									}
								>
									<Hash size={"1em"} />
									{tag}
								</NextLink>
							</Button>
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
				<SearchResult {...result} page={page} />
			</Stack>
		</>
	);
};
