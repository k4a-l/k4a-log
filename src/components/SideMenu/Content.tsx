"use client";
import { ChevronDownIcon, ChevronRightIcon, FileIcon } from "lucide-react";
import { useState } from "react";

import { NextLinkButton } from "@/components/Link/NextLink";
import { Button } from "@/park-ui/components/button";
import { normalizePath } from "@/utils/path";
import { css } from "styled-system/css";
import { Box, Stack } from "styled-system/jsx";

import type { FindFromUnion } from "@/utils/type";
import type { Folder } from "scripts/generate/folder";

const RenderFolder = ({
	folder,
}: { folder: FindFromUnion<Folder, "type", "folder"> }) => {
	const [isOpen, setIsOpen] = useState(false);

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
					{folder.name}
				</span>
			</Button>
			{isOpen && (
				<Box borderLeftColor={"gray.3"} borderLeftWidth={1} ml={4}>
					<FolderContent folders={folder.children} />
				</Box>
			)}
		</Stack>
	);
};

const RenderFile = ({
	folder,
}: { folder: FindFromUnion<Folder, "type", "file"> }) => {
	return (
		<NextLinkButton
			display={"flex"}
			fontWeight={"normal"}
			gap={1}
			h="auto"
			href={normalizePath(folder.path)}
			justifyContent={"start"}
			px={1.5}
			py={1.5}
			rounded={"md"}
			textDecoration={"none"}
			variant={"ghost"}
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
				{folder.name}
			</span>
		</NextLinkButton>
	);
};

export const FolderContent = ({ folders }: { folders: Folder[] }) => {
	return (
		<Stack gap={0}>
			{folders.map((f) => (
				<Stack
					className={css({
						display: "block",
					})}
					key={f.path}
				>
					{f.type === "folder" ? (
						<RenderFolder folder={f} />
					) : (
						<RenderFile folder={f} />
					)}
				</Stack>
			))}
		</Stack>
	);
};
