"use client";
import { ChevronDownIcon, ChevronRightIcon, FileIcon } from "lucide-react";
import React, { useMemo, useState } from "react";

import { NextLinkButton } from "@/components/Link/NextLink";
import { Button } from "@/park-ui/components/button";
import { isSamePath, normalizePath, pathSplit } from "@/utils/path";
import { css } from "styled-system/css";
import { Box, HStack, Stack } from "styled-system/jsx";

import type { FindFromUnion } from "@/utils/type";
import type { Folder } from "scripts/generate/folder";
import { usePathname } from "next/navigation";
import { toNoteHref } from "@/features/metadata/constant";

const RenderFolder = React.memo(
	({
		folder,
		depth,
	}: { folder: FindFromUnion<Folder, "type", "folder">; depth: number }) => {
		const pathname = usePathname();

		const targetPath = useMemo(() => {
			const pathnameSplit = pathSplit(pathname);
			return pathnameSplit.slice(1, depth - pathnameSplit.length + 2);
		}, [depth, pathname]);

		const [isOpen, setIsOpen] = useState(
			isSamePath(pathSplit(folder.path).join("/"), targetPath.join("/")),
		);

		return (
			<Stack gap={0}>
				<Button
					display={"flex"}
					fontWeight={"normal"}
					gap={1}
					h="auto"
					justifyContent={"start"}
					onClick={() => setIsOpen(!isOpen)}
					px={1.5}
					py={1.5}
					rounded={"md"}
					textDecoration={"none"}
					variant={"ghost"}
					w="auto"
				>
					{isOpen ? (
						<ChevronDownIcon
							className={css({
								width: "1em",
								height: "1em",
								flexShrink: 0,
							})}
							size="0.8em"
						/>
					) : (
						<ChevronRightIcon
							className={css({
								width: "1em",
								height: "1em",
								flexShrink: 0,
							})}
							size="0.8em"
						/>
					)}
					<span
						className={css({
							overflow: "hidden",
							textOverflow: "ellipsis",
							textWrap: "nowrap",
						})}
					>
						{folder.title}
					</span>
				</Button>
				{isOpen && (
					<Box borderLeftColor={"gray.3"} borderLeftWidth={1} ml={4}>
						<FolderContentRecursive
							folders={folder.children}
							depth={depth + 1}
						/>
					</Box>
				)}
			</Stack>
		);
	},
);

const RenderFile = React.memo(
	({ folder: file }: { folder: FindFromUnion<Folder, "type", "file"> }) => {
		const pathname = usePathname();

		const isMatch = useMemo(() => {
			return isSamePath(decodeURIComponent(pathname), toNoteHref(file.path));
		}, [pathname, file.path]);
		return (
			<NextLinkButton
				display={"flex"}
				fontWeight={"normal"}
				gap={1}
				h="auto"
				href={toNoteHref(normalizePath(file.path))}
				justifyContent={"start"}
				px={1.5}
				py={1.5}
				rounded={"md"}
				textDecoration={"none"}
				variant={isMatch ? "solid" : "ghost"}
				w="auto"
			>
				<FileIcon
					className={css({
						width: "1em",
						height: "1em",
						flexShrink: 0,
					})}
					opacity={0.6}
				/>
				<span
					className={css({
						overflow: "hidden",
						textOverflow: "ellipsis",
					})}
				>
					{file.title}
				</span>
			</NextLinkButton>
		);
	},
);

const MAX_FILE_IN_FOLDER = 10;
const FolderContentRecursive = React.memo(
	({ folders, depth }: { folders: Folder[]; depth: number }) => {
		const [page, setPage] = useState(0);
		return (
			<Stack gap={0}>
				{folders
					.slice(
						page * MAX_FILE_IN_FOLDER,
						page * MAX_FILE_IN_FOLDER + MAX_FILE_IN_FOLDER,
					)
					.map((f) => (
						<Stack
							className={css({
								display: "block",
							})}
							key={f.path}
						>
							{f.type === "folder" ? (
								<RenderFolder folder={f} depth={depth} />
							) : (
								<RenderFile folder={f} />
							)}
						</Stack>
					))}
				{folders.length > MAX_FILE_IN_FOLDER && (
					<HStack justifyContent={"space-between"}>
						<Button
							disabled={page === 0}
							onClick={() => setPage(page - 1)}
							variant={"outline"}
							size="xs"
							w="full"
						>
							{"<"}
						</Button>
						<Button
							disabled={(page + 1) * 10 >= folders.length}
							onClick={() => setPage(page + 1)}
							variant={"outline"}
							size="xs"
							w="full"
						>
							{">"}
						</Button>
					</HStack>
				)}
			</Stack>
		);
	},
);

export const FolderContent = React.memo(
	({ folders }: { folders: Folder[] }) => {
		return <FolderContentRecursive depth={0} folders={folders} />;
	},
);
