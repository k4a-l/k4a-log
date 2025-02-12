"use client";

import { DeleteIcon, SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { IconButton } from "@/park-ui/components/icon-button";
import { safeDecodeURIComponent } from "@/utils/path";
import { css } from "styled-system/css";
import { HStack } from "styled-system/jsx";

import { getSearchPath } from "./util";

export const SearchBox = () => {
	const searchParams = useSearchParams();
	const query = searchParams.get("query");
	const tag = searchParams.get("tag");

	const router = useRouter();

	const [searchQuery, setSearchQuery] = useState(
		query ? safeDecodeURIComponent(query) : undefined,
	);

	useEffect(() => {
		setSearchQuery(query ? safeDecodeURIComponent(query) : undefined);
	}, [query]);

	const search = () => {
		const path = getSearchPath(
			{ query: searchQuery },
			tag ? new URLSearchParams({ tag }) : undefined,
		);
		router.push(path);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.nativeEvent.isComposing || e.key !== "Enter") return;
		search();
	};

	return (
		<HStack
			className={css({
				height: "full",
			})}
			gap={1}
		>
			<HStack position="relative" w="100%">
				<input
					className={css({
						border: "none",
						padding: "0.5rem",
						borderRadius: "sm",
						width: "full",
						height: "full",
						bg: "neutral.200",
						pr: "2em",
					})}
					onChange={(e) => setSearchQuery(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="タイトル検索"
					type="search"
					value={searchQuery ?? ""}
				/>
				<IconButton
					height="full"
					onClick={() => {
						setSearchQuery(undefined);
					}}
					position={"absolute"}
					right="0"
					rounded={"none"}
					size="sm"
					variant={"ghost"}
				>
					<DeleteIcon />
				</IconButton>
			</HStack>

			<IconButton onClick={search} size="sm" variant={"ghost"}>
				<SearchIcon />
			</IconButton>
		</HStack>
	);
};
