import { searchPath } from "@/app/search/util";
import { NextLink, NextLinkButton } from "@/components/Link/NextLink";
import { postDirPath } from "@/constants/path";
import { getVaultObject } from "@/features/file/io";
import {
	MapPinHouseIcon,
	MessageCircleQuestionIcon,
	NotebookIcon,
	RabbitIcon,
	SearchIcon,
} from "lucide-react";
import { css } from "styled-system/css";
import { HStack, Spacer, Stack } from "styled-system/jsx";

import path from "node:path";
import { Link } from "@/park-ui/components/link";
import { normalizePath } from "@/utils/path";
import Fuse from "fuse.js";

export const PostNotFound = async ({ href: _href }: { href: string }) => {
	const href = decodeURIComponent(_href.split(/\\|\//).join("/"));
	const vault = getVaultObject();

	const searchTargets = vault.posts.map((p) => ({
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
			justifyContent={"center"}
			alignItems={"start"}
			w="100%"
			className={`${css({
				fontSize: { sm: "1em", base: "0.8em" },
				"& > *": {
					wordBreak: "break-all",
					minW: 0,
				},
			})}, `}
			h="100%"
		>
			<Stack
				bg="white"
				p={4}
				rounded={"md"}
				maxW={"max(1000px,100%)"}
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
						<HStack gap={1} alignItems={"end"}>
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
							flexWrap={"wrap"}
							borderWidth={"1px"}
							borderRadius={"md"}
							borderColor={"gray.3"}
							p={2}
						>
							<ul
								className={css({
									py: 0,
									my: 0,
								})}
							>
								{result.map((r) => (
									<li key={r.item.path}>
										<Link
											asChild
											textAlign={"end"}
											alignItems={"end"}
											lineHeight={"1em"}
											gap={1}
											flexWrap={"wrap"}
										>
											<NextLink
												href={path.join("/", normalizePath(r.item.path))}
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
													({normalizePath(r.item.path).replace(postDirPath, "")}
													)
												</span>
											</NextLink>
										</Link>
									</li>
								))}
							</ul>
						</HStack>
					</Stack>
				)}
				<Spacer />
				<HStack>
					<NextLinkButton href={postDirPath} variant={"subtle"}>
						<NotebookIcon />
						トップページ
					</NextLinkButton>
					<NextLinkButton href={searchPath} variant={"subtle"}>
						<SearchIcon />
						検索ページ
					</NextLinkButton>
				</HStack>
			</Stack>
		</HStack>
	);
};
