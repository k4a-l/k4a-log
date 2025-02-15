import { MenuIcon, XIcon } from "lucide-react";
import React from "react";

import { Drawer } from "@/park-ui/components/drawer";
import { IconButton } from "@/park-ui/components/icon-button";
import { css } from "styled-system/css";
import { Stack } from "styled-system/jsx";

import { FolderContent } from "./Content";

import type { Folder } from "scripts/generate/folder";
import { HEADER_HEIGHT } from "../Layout";

type Props = { folders: Folder[] };

export const SideMenuInnerPart = React.memo(({ folders }: Props) => {
	return (
		<Stack
			bg="white"
			className={css({
				px: 2,
				py: 2,
				gap: 2,
			})}
			display={{
				lg: "flex",
				base: "none",
			}}
			flexGrow={1}
			maxW="300px"
			overflowX={"hidden"}
			overflowY={"auto"}
			position={"sticky"}
			rounded={"md"}
			scrollbarWidth={"thin"}
			style={{
				top: `calc(${HEADER_HEIGHT})`,
				maxHeight: `calc(100vh - ${HEADER_HEIGHT} - 8px)`,
			}}
			w="auto"
		>
			<FolderContent folders={folders} />
		</Stack>
	);
});

export const SideMenuDrawer = ({ folders }: Props) => {
	return (
		<Drawer.Root variant={"left"}>
			<Drawer.Trigger
				asChild
				className={css({
					display: {
						lg: "none",
						base: "flex",
					},
				})}
			>
				<IconButton p={1} rounded={"sm"} size="sm" variant={"ghost"}>
					<MenuIcon />
				</IconButton>
			</Drawer.Trigger>
			<Drawer.Positioner zIndex={"banner"}>
				<Drawer.Content>
					<Drawer.Header>
						<Drawer.CloseTrigger
							asChild
							position="absolute"
							right="2"
							top="1.5"
						>
							<IconButton variant="ghost">
								<XIcon />
							</IconButton>
						</Drawer.CloseTrigger>
					</Drawer.Header>
					<Drawer.Body h="full" padding={1}>
						<Stack h="full" overflowX={"hidden"} overflowY={"auto"}>
							<FolderContent folders={folders} />
							{/* <Divider /> */}
							{/* <BookmarkGroup items={bookmark.items} /> */}
						</Stack>
					</Drawer.Body>
				</Drawer.Content>
			</Drawer.Positioner>
		</Drawer.Root>
	);
};
