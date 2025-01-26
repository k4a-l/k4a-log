import { HEADER_HEIGHT } from "@/app/layout";
import { Drawer } from "@/park-ui/components/drawer";
import { IconButton } from "@/park-ui/components/icon-button";
import {} from "@/utils/path";
import { MenuIcon, PinIcon, XIcon } from "lucide-react";
import { css } from "styled-system/css";
import { Divider, HStack, Stack } from "styled-system/jsx";
import { BookmarkGroup } from "./Content";
import type { BookMarkRoot } from "./type";

export const BookmarkInnerPart = ({ root }: { root: BookMarkRoot }) => {
	if (root.items.length === 0) {
		return null;
	}

	return (
		<Stack
			w={1280 - 1000 - 10}
			display={{
				xl: "flex",
				base: "none",
			}}
			bg="white"
			rounded={"md"}
			style={{
				top: `calc(${HEADER_HEIGHT} + 8px)`,
				maxHeight: `calc(100vh - ${HEADER_HEIGHT} - 8px)`,
			}}
			position={"sticky"}
			overflowX={"hidden"}
			overflowY={"auto"}
			className={css({
				px: 2,
				py: 2,
				gap: 2,
			})}
		>
			<HStack>
				<PinIcon size="0.8em" />
			</HStack>
			<Divider />
			<BookmarkGroup items={root.items} />
		</Stack>
	);
};

export const BookmarkDrawer = ({ root }: { root: BookMarkRoot }) => {
	if (root.items.length === 0) {
		return null;
	}

	const props: Drawer.RootProps = { variant: "left" };

	return (
		<Drawer.Root variant={"left"}>
			<Drawer.Trigger
				asChild
				className={css({
					display: {
						xl: "none",
						base: "flex",
					},
				})}
			>
				<IconButton size="sm" rounded={"sm"} p={1} variant={"ghost"}>
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
							top="1.5"
							right="2"
						>
							<IconButton variant="ghost">
								<XIcon />
							</IconButton>
						</Drawer.CloseTrigger>
					</Drawer.Header>
					<Drawer.Body h="full">
						<Stack h="full" overflowX={"hidden"} overflowY={"auto"}>
							<BookmarkGroup items={root.items} />
						</Stack>
					</Drawer.Body>
				</Drawer.Content>
			</Drawer.Positioner>
		</Drawer.Root>
	);
};
