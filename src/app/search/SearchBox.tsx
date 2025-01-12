"use client";

import { IconButton } from "@/park-ui/components/icon-button";
import { SearchIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { css } from "styled-system/css";
import { HStack } from "styled-system/jsx";
import { getSearchPath } from "./util";

export const SearchBox = () => {
	const searchParams = useSearchParams();
	const query = searchParams.get("query");
	const tag = searchParams.get("tag");

	const router = useRouter();

	const [searchQuery, setSearchQuery] = useState(query ?? undefined);

	const search = () => {
		const path = getSearchPath(
			{ query: searchQuery },
			tag ? new URLSearchParams({ tag }) : undefined,
		);
		router.push(path);
	};

	return (
		<HStack
			gap={1}
			className={css({
				width: "max(40%,200px)",
				height: "full",
			})}
		>
			<input
				className={css({
					border: "none",
					padding: "0.5rem",
					borderRadius: "sm",
					width: "full",
					height: "full",
					bg: "neutral.200",
				})}
				type="search"
				value={searchQuery ?? ""}
				onChange={(e) => setSearchQuery(e.target.value)}
			/>
			<IconButton variant={"ghost"} size="sm" onClick={search}>
				<SearchIcon />
			</IconButton>
		</HStack>
	);
};
