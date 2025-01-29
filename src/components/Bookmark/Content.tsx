import { ChevronDownIcon, FileIcon } from "lucide-react";
import path from "path-browserify";

import { NextLinkButton } from "@/components/Link/NextLink";
import { notesDirPath } from "@/features/metadata/constant";
import { dividePathAndExtension, normalizePath } from "@/utils/path";
import { css } from "styled-system/css";
import { HStack, Stack } from "styled-system/jsx";

import type { BookMarkItem } from "./type";

export const BookmarkGroup = ({ items }: { items: BookMarkItem[] }) => {
	return (
		<ul
			className={css({
				pl: 0,
				py: 0,
				my: 0,
			})}
		>
			{items.map((item) => (
				<li
					className={css({
						listStyle: "none",
						h: "auto",
					})}
					key={item.type === "file" ? item.path : item.title}
				>
					{item.type === "file" ? (
						<NextLinkButton
							display={"flex"}
							fontWeight={"normal"}
							gap={1}
							h="auto"
							href={path.join("/", notesDirPath, normalizePath(item.path))}
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
								{item.title ??
									dividePathAndExtension(item.path)[0].split(/\/|\\/).pop()}
							</span>
						</NextLinkButton>
					) : (
						<Stack gap={0} px={1.5}>
							<HStack gap={1} py={1.5}>
								<ChevronDownIcon
									className={css({
										flexShrink: 0,
									})}
									size="0.8em"
								/>
								<span
									className={css({
										fontSize: "0.9em",
										overflow: "hidden",
										textOverflow: "ellipsis",
										textWrap: "nowrap",
									})}
								>
									{item.title}
								</span>
							</HStack>
							<Stack
								borderLeftColor={"gray.3"}
								borderLeftWidth={1}
								className={css({
									"& ul": {
										pl: 1,
									},
								})}
								ml={1.5}
								pl={0}
							>
								<BookmarkGroup items={item.items} />
							</Stack>
						</Stack>
					)}
				</li>
			))}
		</ul>
	);
};
