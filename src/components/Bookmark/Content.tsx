import { postDirPath } from "@/constants/path";
import { dividePathAndExtension, normalizePath } from "@/utils/path";
import { ChevronDownIcon, FileIcon } from "lucide-react";
import { css } from "styled-system/css";
import type { BookMarkItem } from "./type";

import { NextLinkButton } from "@/components/Link/NextLink";
import path from "path-browserify";
import { HStack, Stack } from "styled-system/jsx";

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
					key={item.type === "file" ? item.path : item.title}
					className={css({
						listStyle: "none",
						h: "auto",
					})}
				>
					{item.type === "file" ? (
						<NextLinkButton
							display={"flex"}
							justifyContent={"start"}
							fontWeight={"normal"}
							textDecoration={"none"}
							w="auto"
							h="auto"
							px={1.5}
							py={1.5}
							rounded={"md"}
							href={path.join("/", postDirPath, normalizePath(item.path))}
							variant={"ghost"}
							gap={1}
						>
							<FileIcon
								opacity={0.6}
								className={css({
									width: "1em",
									height: "1em",
									flexShrink: 0,
								})}
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
						<Stack px={1.5} gap={0}>
							<HStack gap={1} py={1.5}>
								<ChevronDownIcon
									size="0.8em"
									className={css({
										flexShrink: 0,
									})}
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
								pl={0}
								ml={1.5}
								borderLeftWidth={1}
								borderLeftColor={"gray.3"}
								className={css({
									"& ul": {
										pl: 1,
									},
								})}
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
