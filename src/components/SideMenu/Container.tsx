import { MenuIcon, PinIcon, XIcon } from "lucide-react";

import { HEADER_HEIGHT } from "@/app/layout";
import { Drawer } from "@/park-ui/components/drawer";
import { IconButton } from "@/park-ui/components/icon-button";
import { css } from "styled-system/css";
import { Divider, HStack, Stack } from "styled-system/jsx";

import { BookmarkGroup, type BookMarkRoot } from "../Bookmark";

import { FolderContent } from "./Content";

import type { Folder } from "scripts/generate/folder";

type Props = { bookmark: BookMarkRoot; folders: Folder[] };

export const SideMenuInnerPart = ({ bookmark, folders }: Props) => {
	if (bookmark.items.length === 0) {
		return null;
	}

	return (
		<Stack
			bg="white"
			className={css({
				px: 2,
				py: 2,
				gap: 2,
			})}
			display={{
				"2xl": "flex",
				base: "none",
			}}
			overflowX={"hidden"}
			overflowY={"auto"}
			position={"sticky"}
			rounded={"md"}
			style={{
				top: `calc(${HEADER_HEIGHT} + 8px)`,
				maxHeight: `calc(100vh - ${HEADER_HEIGHT} - 8px)`,
			}}
			w={1280 - 1000 - 10}
		>
			<FolderContent folders={folders} />
			<HStack>
				<PinIcon size="0.8em" />
			</HStack>
			<Divider />
			<BookmarkGroup items={bookmark.items} />
		</Stack>
	);
};

export const SideMenuDrawer = ({ bookmark: root, folders }: Props) => {
	if (root.items.length === 0) {
		return null;
	}

	return (
		<Drawer.Root defaultOpen variant={"left"}>
			<Drawer.Trigger
				asChild
				className={css({
					display: {
						"2xl": "none",
						base: "flex",
					},
				})}
			>
				<IconButton p={1} rounded={"sm"} size="sm" variant={"ghost"}>
					<MenuIcon />
				</IconButton>
			</Drawer.Trigger>
			<Drawer.Positioner>
				<Drawer.Content
					className={css({
						display: {
							xl: "none",
							base: "block",
						},
					})}
				>
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
							<BookmarkGroup items={root.items} />
						</Stack>
					</Drawer.Body>
				</Drawer.Content>
			</Drawer.Positioner>
		</Drawer.Root>
	);
};
