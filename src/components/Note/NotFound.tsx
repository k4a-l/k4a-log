import path from "node:path";

import Fuse from "fuse.js";
import {
	MapPinHouseIcon,
	MessageCircleQuestionIcon,
	NotebookIcon,
	RabbitIcon,
	SearchIcon,
} from "lucide-react";

import { searchPath } from "@/app/search/util";
import { NextLink, NextLinkButton } from "@/components/Link/NextLink";
import { getVaultObject } from "@/features/file/io";
import { notesDirPath } from "@/features/metadata/constant";
import { Link } from "@/park-ui/components/link";
import { normalizePath, safeDecodeURIComponent } from "@/utils/path";
import { css } from "styled-system/css";
import { HStack, Spacer, Stack } from "styled-system/jsx";

export const NoteNotFound = async ({ href: _href }: { href: string }) => {
	const href = safeDecodeURIComponent(_href.split(/\\|\//).join("/"));
	const vault = getVaultObject();

	const searchTargets = vault.notes.map((p) => ({
		...p,
		title: p.metadata.frontmatter?.title ?? p.basename,
	}));

	const fuse = new Fuse(searchTargets, {
		keys: ["title", "path"] satisfies (keyof (typeof searchTargets)[number])[],
		threshold: 0.5,
	});
	const result = fuse.search(href);

	return (
		<HStack
			alignItems={"start"}
			className={`${css({
				fontSize: { sm: "1em", base: "0.8em" },
				"& > *": {
					wordBreak: "break-all",
					minW: 0,
				},
			})}, `}
			h="100%"
			justifyContent={"center"}
			w="100%"
		>
			<Stack
				bg="white"
				maxW={"max(1000px,100%)"}
				p={4}
				rounded={"md"}
				w={"1000px"}
			>
				<HStack alignItems={"end"}>
					<h1
						className={css({
							p: 0,
							m: 0,
							lineHeight: "1",
						})}
					>
						404
					</h1>
					<span>Not Found</span>
					<RabbitIcon />
					<MessageCircleQuestionIcon />
				</HStack>

				<p>「{href}」ページが見つかりませんでした</p>
				{result.length !== 0 && (
					<Stack gap={1}>
						<HStack alignItems={"end"} gap={1}>
							<MapPinHouseIcon />
							<span
								className={css({
									fontSize: "0.8em",
								})}
							>
								類似ページ
							</span>
						</HStack>
						<HStack
							borderColor={"gray.3"}
							borderRadius={"md"}
							borderWidth={"1px"}
							flexWrap={"wrap"}
							p={2}
						>
							<ul
								className={css({
									py: 0,
									my: 0,
								})}
							>
								{result.map((r) => {
									const pathOrId =
										vault.pathMap[normalizePath(r.item.path)] ?? r.item.path;
									return (
										<li key={r.item.path}>
											<Link
												alignItems={"end"}
												asChild
												flexWrap={"wrap"}
												gap={1}
												lineHeight={"1em"}
												textAlign={"end"}
											>
												<NextLink
													href={path.join("/", normalizePath(pathOrId))}
												>
													<span
														className={css({
															lineHeight: "1.4em",
														})}
													>
														{r.item.metadata.frontmatter?.title ??
															r.item.basename}
													</span>
													<span
														className={css({
															fontSize: "0.6em",
															lineHeight: "1.8em",
														})}
													>
														({normalizePath(pathOrId).split("/").join("/")})
													</span>
												</NextLink>
											</Link>
										</li>
									);
								})}
							</ul>
						</HStack>
					</Stack>
				)}
				<Spacer />
				<HStack>
					<NextLinkButton
						href={path.join("/", notesDirPath)}
						variant={"subtle"}
					>
						<NotebookIcon />
						トップページ
					</NextLinkButton>
					<NextLinkButton href={path.join("/", searchPath)} variant={"subtle"}>
						<SearchIcon />
						検索ページ
					</NextLinkButton>
				</HStack>
			</Stack>
		</HStack>
	);
};
