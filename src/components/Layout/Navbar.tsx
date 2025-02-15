"use client";

import { HashIcon, SearchIcon } from "lucide-react";
import Image from "next/image";
import path from "path-browserify";
import {} from "react";

import { getSearchPath } from "@/app/search/util";
import { NextLink } from "@/components/Link/NextLink";
import { SideMenuDrawer } from "@/components/SideMenu";
import { notesDirPath } from "@/features/metadata/constant";
import { Button } from "@/park-ui/components/button";
import { Link } from "@/park-ui/components/link";
import { css } from "styled-system/css";
import { HStack, Spacer } from "styled-system/jsx";

import type { Folder } from "scripts/generate/folder";

export const HEADER_HEIGHT = "34px";

export const Navbar = ({ folders }: { folders: Folder[] }) => {
	return (
		<HStack
			className={css({
				bg: "white",
				position: "sticky",
				top: 0,
				zIndex: 1,
				h: HEADER_HEIGHT,
				px: 1,
				py: 1,
				boxShadow: "sm",
				w: "full",
			})}
			justifyContent={"space-between"}
		>
			<SideMenuDrawer folders={folders} />
			<Link asChild>
				<NextLink href={path.join("/", notesDirPath)}>
					<Image alt="logo" height={30} src="/assets/logo.png" width={30} />
				</NextLink>
			</Link>
			<Spacer />
			<Button
				asChild
				gap={0}
				h="100%"
				px={2}
				size="xs"
				textDecoration={"none"}
				variant={"ghost"}
			>
				<NextLink href={getSearchPath({})}>
					<HashIcon strokeWidth={2} />
					/
					<SearchIcon strokeWidth={2} />
				</NextLink>
			</Button>
		</HStack>
	);
};
