"use client";

import { LinkIcon } from "lucide-react";

import { useHonoQuery } from "@/app/search/hono";
import { toNoteHref } from "@/features/metadata/constant";
import {
	createParseProcessor,
	createRunProcessor,
	createStringifyProcessor,
} from "@/features/remark/processor";
import { processRemark } from "@/features/remark/processor/process";
import { IconButton } from "@/park-ui/components/icon-button";
import { Spinner } from "@/park-ui/components/spinner";
import { convertPathsToLocalMD, safeDecodeURIComponent } from "@/utils/path";
import { css } from "styled-system/css";
import { Stack, HStack } from "styled-system/jsx";

import { embedMarkdownClass } from "../Toc";

import { EmbedLinkNotFound } from "./LinkPresentational";
import { NextLink } from "./NextLink";

import type { WikiLinkData } from "@/types/mdast";
import type { FC, PropsWithChildren } from "react";

export const EmbedLinkMarkdownLayout: FC<
	PropsWithChildren<{ title: string; href: string }>
> = ({ href, title, children }) => {
	if (!href) {
		return <EmbedLinkNotFound title={title} />;
	}
	return (
		<Stack
			className={`${css({
				borderWidth: 1,
				borderColor: "gray.3",
				w: "100%",
			})}, ${embedMarkdownClass}`}
			my={4}
		>
			<HStack
				className={css({
					borderBottomWidth: "1",
					borderBottomColor: "gray.3",
					px: 2,
					py: 1,
				})}
				justifyContent={"space-between"}
			>
				<span
					className={css({
						fontWeight: "bold",
						fontSize: "1em",
					})}
				>
					{title}
				</span>
				<IconButton asChild color="blue.10" size="xs" variant={"ghost"}>
					<NextLink href={toNoteHref(href)}>
						<LinkIcon size={"1em"} />
					</NextLink>
				</IconButton>
			</HStack>
			<span
				className={css({
					maxH: "600px",
					overflow: "auto",
					scrollbarWidth: "thin",
					px: 2,
					pb: 1,
					fontWeight: "normal",
				})}
			>
				{children}
			</span>
		</Stack>
	);
};

type Props = Pick<
	WikiLinkData["hProperties"],
	"alias" | "href" | "title" | "parentsLinks"
>;
export const EmbedLinkMarkdown: FC<Props> = (props) => {
	const { parentsLinks, href, title, alias } = props;

	const queryResult = useHonoQuery("note", {
		path: encodeURIComponent(href),
		parentsLinks: encodeURIComponent(parentsLinks),
	});

	if (queryResult.isLoading) return <Spinner />;
	if (queryResult.error) return "データが取得できませんでした";
	if (!queryResult.data) return <EmbedLinkNotFound title={title} />;

	const { pathMap, note, vaultPaths, fileContent } = queryResult.data;

	if (!note) return <EmbedLinkNotFound title={title} />;

	const paths = href.split(/\\|\//);

	const parentLinksArr = parentsLinks
		.split(" ")
		.map((p) => safeDecodeURIComponent(p));

	const remarkProcessor = createParseProcessor(
		parentLinksArr,
		vaultPaths,
		pathMap,
	);
	const rehypeProcessor = createRunProcessor({
		listItems: note.metadata.listItems,
	});
	const stringifyProcessor = createStringifyProcessor();

	const { fPath, header } = convertPathsToLocalMD(paths);
	const data = processRemark(
		{ fPath, header, title: alias ?? title },
		remarkProcessor,
		rehypeProcessor,
		stringifyProcessor,
		fileContent,
	);

	if (!data) return <EmbedLinkNotFound title={title} />;

	return data.content;
};
